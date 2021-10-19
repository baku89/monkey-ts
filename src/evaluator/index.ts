import * as ast from '../ast'
import * as value from '../value'
import {builtins} from './builtins'

export const NULL = new value.Null()
export const TRUE = new value.Bool(true)
export const FALSE = new value.Bool(false)

export function evaluate(node: ast.Node, env: value.Env): value.Value {
	switch (node.type) {
		case 'program':
			return evalProgram(node, env)
		case 'int':
			return new value.Int(node.value)
		case 'str':
			return new value.Str(node.value)

		case 'bool':
			return nativeBoolToBoolValue(node.value)
		case 'prefix': {
			const right = evaluate(node.right, env)
			if (isError(right)) return right
			return evalPrefixExpression(node.operator, right)
		}
		case 'infix': {
			node.left
			const left = evaluate(node.left, env)
			if (isError(left)) return left
			const right = evaluate(node.right, env)
			if (isError(right)) return right
			return evalInfixExpression(node.operator, left, right)
		}
		case 'if':
			return evalIfExpression(node, env)
		case 'expressionStatement':
			return evaluate(node.expression, env)
		case 'block':
			return evalBlockStatement(node, env)
		case 'return': {
			const val = evaluate(node.returnValue, env)
			if (isError(val)) return val
			return new value.Return(val)
		}
		case 'let': {
			const val = evaluate(node.value, env)
			if (isError(val)) return val
			env.set(node.name.value, val)
			break
		}
		case 'identifier':
			return evalIdentifier(node, env)
		case 'fn':
			return new value.Fn(node.parameters, node.body, env)
		case 'vector': {
			const elements = evalExpressions(node.elements, env)
			if (elements.length === 1 && isError(elements[0])) {
				return elements[0]
			}
			return new value.Vector(elements)
		}

		case 'call': {
			const fn = evaluate(node.fn, env)
			if (isError(fn)) return fn
			const args = evalExpressions(node.args, env)
			if (args.length === 1 && isError(args[0])) {
				return args[0]
			}
			return applyFunction(fn, args)
		}
	}

	return NULL
}

function nativeBoolToBoolValue(value: boolean): value.Bool {
	return value ? TRUE : FALSE
}

function evalProgram(program: ast.Program, env: value.Env): value.Value {
	let result: value.Value = NULL

	for (const stmt of program.statements) {
		result = evaluate(stmt, env)
		if (result.type === 'return') {
			return result.value
		}
		if (result.type === 'error') {
			return result
		}
	}

	return result
}

function evalBlockStatement(block: ast.Block, env: value.Env): value.Value {
	let result: value.Value = NULL

	for (const stmt of block.statements) {
		result = evaluate(stmt, env)
		if (result.type === 'return') {
			return result
		}
		if (result.type === 'error') {
			return result
		}
	}

	return result
}

function evalExpressions(
	exps: ast.Expression[],
	env: value.Env
): value.Value[] {
	const result: value.Value[] = []

	for (const e of exps) {
		const evaluated = evaluate(e, env)
		if (isError(evaluated)) {
			return [evaluated]
		}
		result.push(evaluated)
	}

	return result
}

function evalPrefixExpression(
	operator: string,
	right: value.Value
): value.Value {
	switch (operator) {
		case '!':
			return evalBangOperatorExpression(right)
		case '-':
			return evalMinusPrefixOperatorExpression(right)
		default:
			return new value.Error(`unknown operator: ${operator}${right.type}`)
	}
}

function evalBangOperatorExpression(right: value.Value): value.Bool {
	switch (right) {
		case TRUE:
			return FALSE
		case FALSE:
			return TRUE
		case NULL:
			return TRUE
		default:
			return FALSE
	}
}

function evalMinusPrefixOperatorExpression(right: value.Value): value.Value {
	if (right.type !== 'int') {
		return new value.Error(`unknown operator: -${right.type}`)
	}

	return new value.Int(-right.value)
}

function evalInfixExpression(
	operator: string,
	left: value.Value,
	right: value.Value
): value.Value {
	if (left.type === 'int' && right.type === 'int') {
		return evalIntInfixExpression(operator, left, right)
	}
	if (left.type === 'str' && right.type === 'str') {
		return evalStrInfixExpression(operator, left, right)
	}

	switch (operator) {
		case '==':
			return nativeBoolToBoolValue(left === right)
		case '!=':
			return nativeBoolToBoolValue(left !== right)
	}

	// Error handlings
	if (left.type !== right.type) {
		return new value.Error(
			`type mismatch: ${left.type} ${operator} ${right.type}`
		)
	}

	return new value.Error(
		`unknown operator: ${left.type} ${operator} ${right.type}`
	)
}

function evalIntInfixExpression(
	operator: string,
	left: value.Int,
	right: value.Int
): value.Value {
	switch (operator) {
		case '+':
			return new value.Int(left.value + right.value)
		case '-':
			return new value.Int(left.value - right.value)
		case '*':
			return new value.Int(left.value * right.value)
		case '/':
			return new value.Int(left.value / right.value)
		case '<':
			return nativeBoolToBoolValue(left.value < right.value)
		case '>':
			return nativeBoolToBoolValue(left.value > right.value)
		case '==':
			return nativeBoolToBoolValue(left.value === right.value)
		case '!=':
			return nativeBoolToBoolValue(left.value !== right.value)
		default:
			return new value.Error(
				`unknown operator: ${left.type} ${operator} ${right.type}`
			)
	}
}

function evalStrInfixExpression(
	operator: string,
	left: value.Str,
	right: value.Str
) {
	switch (operator) {
		case '+':
			return new value.Str(left.value + right.value)
		case '==':
			return nativeBoolToBoolValue(left.value === right.value)
		case '!=':
			return nativeBoolToBoolValue(left.value !== right.value)
		default:
			return new value.Error(
				`unknown operator: ${left.type} ${operator} ${right.type}`
			)
	}
}

function evalIfExpression(ie: ast.If, env: value.Env) {
	const condition = evaluate(ie.condition, env)
	if (isError(condition)) return condition

	if (isTruthy(condition)) {
		return evaluate(ie.consequence, env)
	} else if (ie.alternative) {
		return evaluate(ie.alternative, env)
	} else {
		return NULL
	}
}

function evalIdentifier(node: ast.Identifier, env: value.Env) {
	const val = env.get(node.value)
	if (val) {
		return val
	}

	const builtin = builtins.get(node.value)
	if (builtin) {
		return builtin
	}

	return new value.Error(`identifier not found: ${node.value}`)
}

function applyFunction(fn: value.Value, args: value.Value[]) {
	if (fn.type === 'fn') {
		const extendedEnv = extendFunctionEnv(fn, args)
		const evaluated = evaluate(fn.body, extendedEnv)
		return unwrapReturnValue(evaluated)
	}
	if (fn.type === 'builtin') {
		return fn.fn(...args)
	}

	return new value.Error(`not a function: ${fn.type}`)

	function extendFunctionEnv(fn: value.Fn, args: value.Value[]) {
		const env = new value.Env(fn.env)

		fn.parameters.forEach((param, i) => {
			env.set(param.value, args[i])
		})

		return env
	}

	function unwrapReturnValue(val: value.Value) {
		if (val.type === 'return') return val.value
		return val
	}
}

function isTruthy(val: value.Value) {
	switch (val) {
		case NULL:
			return false
		case TRUE:
			return true
		case FALSE:
			return false
		default:
			return true
	}
}

function isError(val: value.Value): val is value.Error {
	return val.type === 'error'
}
