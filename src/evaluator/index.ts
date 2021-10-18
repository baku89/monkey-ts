import * as ast from '../ast'
import Value, * as value from '../value'

export function evaluate(node: ast.Node): Value {
	if (node instanceof ast.Program) {
		return evaluateStatements(node.statements)
	} else if (node instanceof ast.ExpressionStatement) {
		return evaluate(node.expression)
	} else if (node instanceof ast.IntegerLiteral) {
		return new value.Integer(node.value)
	}

	throw new Error('Not yet implemented')
}

function evaluateStatements(stmts: ast.Statement[]): Value {
	const results = stmts.map(evaluate)

	return results[results.length - 1]
}
