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
		return node.value ? TRUE : FALSE
	} else if (node instanceof ast.PrefixExpression) {
		const right = evaluate(node.right)
		return evalPrefixExpression(node.operator, right)
	}

	return NULL
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
