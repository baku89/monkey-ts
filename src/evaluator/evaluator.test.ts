import {evaluate} from '../evaluator'
import {Lexer} from '../lexer'
import {Parser} from '../parser'
import Value, * as value from '../value'

test('eval integer expression', () => {
	runTest('5', 5)
	runTest('10', 10)

	function runTest(input: string, expected: number) {
		const val = testEval(input)
		testIntegerValue(val, expected)
	}
})

function testEval(input: string): Value {
	const l = new Lexer(input)
	const p = new Parser(l)

	const program = p.parseProgram()
	return evaluate(program)
}

function testIntegerValue(val: Value, expected: number) {
	expect(val).toBeInstanceOf(value.Integer)

	const int = val as value.Integer

	expect(int.value).toBe(expected)
}
