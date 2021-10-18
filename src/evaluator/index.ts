import * as ast from '../ast'
import Value, * as value from '../value'

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
	}

	throw new Error('Not yet implemented')
}

function evaluateStatements(stmts: ast.Statement[]): Value {
	const results = stmts.map(evaluate)

	return results[results.length - 1]
}
