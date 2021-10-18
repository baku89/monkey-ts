import {evaluate, NULL} from '../evaluator'
import {Lexer} from '../lexer'
import {Parser} from '../parser'
import * as value from '../value'

describe('eval integer expression', () => {
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
		test(`'${input}' to be ${expected}`, () => {
			const val = testEval(input)
			testIntegerValue(val, expected)
		})
	}
})

describe('eval bool expression', () => {
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
		test(`'${input}' to be ${expected}`, () => {
			const val = testEval(input)
			testBoolValue(val, expected)
		})
	}
})

describe('if-else expressions', () => {
	runTest('if (true) { 10 }', 10)
	runTest('if (false) { 10 }', null)
	runTest('if (1) { 10 }', 10)
	runTest('if (1 < 2) { 10 }', 10)
	runTest('if (1 > 2) { 10 }', null)
	runTest('if (1 > 2) { 10 } else { 20 }', 20)
	runTest('if (1 < 2) { 10 } else { 20 }', 10)

	function runTest(input: string, expected: number | null) {
		test(`'${input}'' to be ${expected}`, () => {
			const val = testEval(input)
			if (val.type === 'integer' && typeof expected === 'number') {
				testIntegerValue(val, expected)
				return
			}
			if (val.type === 'null' && expected === null) {
				testNullValue(val)
				return
			}

			throw new Error('Invalid test')
		})
	}
})

describe('eval bang operator', () => {
	runTest('!true', false)
	runTest('!false', true)
	runTest('!5', false)
	runTest('!!true', true)
	runTest('!!false', false)
	runTest('!!5', true)

	function runTest(input: string, expected: boolean) {
		test(`'${input}' to be ${expected}`, () => {
			const val = testEval(input)
			testBoolValue(val, expected)
		})
	}
})

describe('return statements', () => {
	runTest('return 10;', 10)
	runTest('return 10; 9;', 10)
	runTest('return 2 * 5; 9;', 10)
	runTest('9; return 2 * 5; 9;', 10)
	runTest(
		`
if (10 > 1) {
	if (10 > 1) {
		return 10;
	}

	return 1;
}`,
		10
	)

	function runTest(input: string, expected: number) {
		test(`'${input}' to be ${expected}`, () => {
			const val = testEval(input)
			testIntegerValue(val, expected)
		})
	}
})

describe('error handling', () => {
	runTest('5 + true;', 'type mismatch: integer + bool')
	runTest('5 + true; 5', 'type mismatch: integer + bool')
	runTest('-true', 'unknown operator: -bool')
	runTest('true + false;', 'unknown operator: bool + bool')
	runTest('5; true + false; 5;', 'unknown operator: bool + bool')
	runTest(
		'if (10 > 5) { return true + false; }',
		'unknown operator: bool + bool'
	)
	runTest(
		`
if (10 > 1) {
	if (10 > 1) {
		return true + false;
	}
}

return 1;
	`,
		'unknown operator: bool + bool'
	)

	function runTest(input: string, expectedMessage: string) {
		test(`'${input}' to be an errror with message '${expectedMessage}'`, () => {
			const val = testEval(input)
			expect(val).toBeInstanceOf(value.Error)
			expect((val as value.Error).message).toBe(expectedMessage)
		})
	}
})

function testEval(input: string): value.Value {
	const l = new Lexer(input)
	const p = new Parser(l)

	const program = p.parseProgram()
	return evaluate(program)
}

function testIntegerValue(val: value.Value, expected: number) {
	expect(val).toBeInstanceOf(value.Integer)

	const bool = val as value.Integer

	expect(bool.value).toBe(expected)
}

function testBoolValue(val: value.Value, expected: boolean) {
	expect(val).toBeInstanceOf(value.Bool)

	const bool = val as value.Bool

	expect(bool.value).toBe(expected)
}

function testNullValue(val: value.Value) {
	expect(val).toBe(NULL)
}
