import {evaluate} from '../evaluator'
import {Lexer} from '../lexer'
import {Parser} from '../parser'
import Value, * as value from '../value'

test('eval integer expression', () => {
	runTest('5', 5)
	runTest('10', 10)
	runTest('-5', -5)
	runTest('-10', -10)

	function runTest(input: string, expected: number) {
		const val = testEval(input)
		testIntegerValue(val, expected)
	}
})

test('eval boolean expression', () => {
	runTest('true', true)
	runTest('false', false)

	function runTest(input: string, expected: boolean) {
		const val = testEval(input)
		testBoolValue(val, expected)
	}
})

test('eval bang operator', () => {
	runTest('!true', false)
	runTest('!false', true)
	runTest('!5', false)
	runTest('!!true', true)
	runTest('!!false', false)
	runTest('!!5', true)

	function runTest(input: string, expected: boolean) {
		const val = testEval(input)
		testBoolValue(val, expected)
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

	const bool = val as value.Integer

	expect(bool.value).toBe(expected)
}

function testBoolValue(val: Value, expected: boolean) {
	expect(val).toBeInstanceOf(value.Bool)

	const bool = val as value.Bool

	expect(bool.value).toBe(expected)
}
