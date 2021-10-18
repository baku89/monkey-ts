import * as ast from '../ast'
import * as value from '../value'

export const NULL = new value.Null()
export const TRUE = new value.Bool(true)
export const FALSE = new value.Bool(false)

export function evaluate(node: ast.Node): value.Value {
	if (node instanceof ast.Program) {
		return evalProgram(node)
	}
	if (node instanceof ast.ExpressionStatement) {
		return evaluate(node.expression)
	}
	if (node instanceof ast.IntegerLiteral) {
		return new value.Integer(node.value)
	}
	if (node instanceof ast.BoolLiteral) {
		return nativeBoolToBoolValue(node.value)
	}
	if (node instanceof ast.PrefixExpression) {
		const right = evaluate(node.right)
		if (isError(right)) return right
		return evalPrefixExpression(node.operator, right)
	}
	if (node instanceof ast.InfixExpression) {
		const left = evaluate(node.left)
		if (isError(left)) return left
		const right = evaluate(node.right)
		if (isError(right)) return right
		return evalInfixExpression(node.operator, left, right)
	}
	if (node instanceof ast.BlockStatement) {
		return evalBlockStatement(node)
	}
	if (node instanceof ast.IfExpression) {
		return evalIfExpression(node)
	}
	if (node instanceof ast.ReturnStatement) {
		const val = evaluate(node.returnValue)
		if (isError(val)) return val
		return new value.Return(val)
	}

	return NULL
}

function nativeBoolToBoolValue(value: boolean): value.Bool {
	return value ? TRUE : FALSE
}

function evalProgram(program: ast.Program): value.Value {
	let result: value.Value = NULL

	for (const stmt of program.statements) {
		result = evaluate(stmt)
		if (result.type === 'return') {
			return result.value
		}
		if (result.type === 'error') {
			return result
		}
	}

	return result
}

function evalBlockStatement(block: ast.BlockStatement): value.Value {
	let result: value.Value = NULL

	for (const stmt of block.statements) {
		result = evaluate(stmt)
		if (result.type === 'return') {
			return result
		}
		if (result.type === 'error') {
			return result
		}
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
	if (right.type !== 'integer') {
		return new value.Error(`unknown operator: -${right.type}`)
	}

	return new value.Integer(-right.value)
}

function evalInfixExpression(
	operator: string,
	left: value.Value,
	right: value.Value
): value.Value {
	if (left.type === 'integer' && right.type === 'integer') {
		return evalIntegerInfixExpression(operator, left, right)
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

function evalIntegerInfixExpression(
	operator: string,
	left: value.Integer,
	right: value.Integer
): value.Value {
	switch (operator) {
		case '+':
			return new value.Integer(left.value + right.value)
		case '-':
			return new value.Integer(left.value - right.value)
		case '*':
			return new value.Integer(left.value * right.value)
		case '/':
			return new value.Integer(left.value / right.value)
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

function evalIfExpression(ie: ast.IfExpression) {
	const condition = evaluate(ie.condition)
	if (isError(condition)) return condition

	if (isTruthy(condition)) {
		return evaluate(ie.consequence)
	} else if (ie.alternative) {
		return evaluate(ie.alternative)
	} else {
		return NULL
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
