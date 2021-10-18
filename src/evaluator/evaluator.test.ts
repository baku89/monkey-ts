import {evaluate} from '../evaluator'
import {Lexer} from '../lexer'
import {Parser} from '../parser'
import Value, * as value from '../value'

test('eval integer expression', () => {
	runTest('5', 5)
	runTest('10', 10)
	runTest('-5', -5)
	runTest('-10', -10)
	runTest('5 + 5 + 5 + 5 - 10', 10)
	runTest('2 * 2 * 2 * 2 * 2', 32)
	runTest('-50 + 100 + -50', 0)
	runTest('5 * 2 + 10', 20)
	runTest('5 + 2 * 10', 25)
	runTest('20 + 2 * -10', 0)
	runTest('2 * (5 + 10)', 30)
	runTest('3 * 3 * 3 + 10', 37)
	runTest('(5 + 10 * 2 + 15 / 3) * 2 - 10', 50)

	function runTest(input: string, expected: number) {
		const val = testEval(input)
		testIntegerValue(val, expected)
	}
})

test('eval bool expression', () => {
	runTest('true', true)
	runTest('false', false)
	runTest('1 < 2', true)
	runTest('1 > 2', false)
	runTest('1 < 1', false)
	runTest('1 > 1', false)
	runTest('1 == 1', true)
	runTest('1 != 1', false)
	runTest('1 == 2', false)
	runTest('1 != 2', true)
	runTest('true == true', true)
	runTest('false == false', true)
	runTest('true == false', false)
	runTest('true != false', true)
	runTest('false != true', true)
	runTest('(1 < 2) == true', true)
	runTest('(1 < 2) == false', false)
	runTest('(1 > 2) == true', false)
	runTest('(1 > 2) == false', true)

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
