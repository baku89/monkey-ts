import * as ast from '../ast'
import Value, * as value from '../value'

const NULL = new value.Null()
const TRUE = new value.Bool(true)
const FALSE = new value.Bool(false)

export function evaluate(node: ast.Node): Value {
	if (node instanceof ast.Program) {
		return evaluateStatements(node.statements)
	} else if (node instanceof ast.ExpressionStatement) {
		return evaluate(node.expression)
	} else if (node instanceof ast.IntegerLiteral) {
		return new value.Integer(node.value)
	} else if (node instanceof ast.BoolLiteral) {
		return nativeBoolToBoolValue(node.value)
	} else if (node instanceof ast.PrefixExpression) {
		const right = evaluate(node.right)
		return evalPrefixExpression(node.operator, right)
	} else if (node instanceof ast.InfixExpression) {
		const left = evaluate(node.left)
		const right = evaluate(node.right)
		return evalInfixExpression(node.operator, left, right)
	}

	return NULL
}

function nativeBoolToBoolValue(value: boolean): value.Bool {
	return value ? TRUE : FALSE
}

function evaluateStatements(stmts: ast.Statement[]): Value {
	const results = stmts.map(evaluate)

	return results[results.length - 1]
}

function evalPrefixExpression(operator: string, right: Value) {
	switch (operator) {
		case '!':
			return evalBangOperatorExpression(right)
		case '-':
			return evalMinusPrefixOperatorExpression(right)
		default:
			return NULL
	}
}

function evalBangOperatorExpression(right: Value): value.Bool {
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

function evalMinusPrefixOperatorExpression(right: Value): Value {
	if (right.type !== 'integer') {
		return NULL
	}

	return new value.Integer(-right.value)
}

function evalInfixExpression(operator: string, left: Value, right: Value) {
	if (left.type === 'integer' && right.type === 'integer') {
		return evalIntegerInfixExpression(operator, left, right)
	}

	switch (operator) {
		case '==':
			return nativeBoolToBoolValue(left === right)
		case '!=':
			return nativeBoolToBoolValue(left !== right)
	}

	return NULL
}

function evalIntegerInfixExpression(
	operator: string,
	left: value.Integer,
	right: value.Integer
) {
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
			return NULL
	}
}
