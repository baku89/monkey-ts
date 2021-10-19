import {evaluate, NULL} from '../evaluator'
import {Lexer} from '../lexer'
import {Parser} from '../parser'
import * as value from '../value'

describe('eval int expression', () => {
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
			testIntValue(val, expected)
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
			if (val.type === 'int' && typeof expected === 'number') {
				testIntValue(val, expected)
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
			testIntValue(val, expected)
		})
	}
})

describe('error handling', () => {
	runTest('5 + true;', 'type mismatch: int + bool')
	runTest('5 + true; 5', 'type mismatch: int + bool')
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
	runTest('foobar', 'identifier not found: foobar')
	runTest('"Hello" - "World"', 'unknown operator: str - str')
	runTest('{"name": "monkey"}[fn(x){x}]', 'unusable as dict key: fn')

	function runTest(input: string, expectedMessage: string) {
		test(`'${input}' to be an errror with message '${expectedMessage}'`, () => {
			const val = testEval(input)
			testError(val, expectedMessage)
		})
	}
})

describe('let statements', () => {
	runTest('let a = 5; a;', 5)
	runTest('let a = 5 * 5; a;', 25)
	runTest('let a = 5; let b = a; b;', 5)
	runTest('let a = 5; let b = a; let c = a + b + 5; c;', 15)

	function runTest(input: string, expected: number) {
		test(`'${input}' to be ${expected}`, () => {
			testIntValue(testEval(input), expected)
		})
	}
})

describe('function value', () => {
	const input = 'fn(x) { x + 2};'

	const evaluated = testEval(input)

	expect(evaluated).toBeInstanceOf(value.Fn)

	const fn = evaluated as value.Fn

	expect(fn.parameters).toHaveLength(1)
	expect(fn.parameters[0].value).toBe('x')
	expect(fn.body.toString()).toBe('(x + 2)')
})

describe('function application', () => {
	runTest('let identity = fn(x) { x; }; identity(5);', 5)
	runTest('let identity = fn(x) { return x; }; identity(5);', 5)
	runTest('let double = fn(x) { x * 2; }; double(5);', 10)
	runTest('let add = fn(x, y) { x + y; }; add(5, 5);', 10)
	runTest('let add = fn(x, y) { x + y; }; add(5 + 5, add(5, 5));', 20)
	runTest('fn(x) { x; }(5)', 5)

	function runTest(input: string, expected: number) {
		testIntValue(testEval(input), expected)
	}
})

test('string literal', () => {
	const input = '"Hello World!"'
	const evaluated = testEval(input)
	expect(evaluated).toBeInstanceOf(value.Str)
	expect((evaluated as value.Str).value).toBe('Hello World!')
})

test('string concatenation', () => {
	const input = '"Hello" + " " + "World!"'
	const evaluated = testEval(input)
	expect(evaluated).toBeInstanceOf(value.Str)
	expect((evaluated as value.Str).value).toBe('Hello World!')
})

describe('built-in functions', () => {
	runTest('len("")', 0)
	runTest('len("four")', 4)
	runTest('len("hello world")', 11)
	runTest('len(1)', 'argument to `len` not supported, got=int')
	runTest('len("one", "two")', 'wrong number of arguments. expected=1, got=2')
	runTest('len([1, 2, 3, "str"])', 4)
	runTest('first([1, 2, 3])', 1)
	runTest('first([])', null)
	runTest('last([1, 2, 3])', 3)
	runTest('last([])', null)
	runTest('rest([1, 2, 3])', [2, 3])
	runTest('push([1, 2, 3], 4)', [1, 2, 3, 4])
	runTest('push([], 1)', [1])

	function runTest(input: string, expected: number | null | number[] | string) {
		const evaluated = testEval(input)
		if (typeof expected === 'number') {
			test(`'${input}' to be ${expected}`, () => {
				testIntValue(evaluated, expected)
			})
		} else if (expected === null) {
			test(`'${input}' to be null`, () => {
				testNullValue(evaluated)
			})
		} else if (Array.isArray(expected)) {
			test(`'${input}' to be [${expected}]`, () => {
				expect(evaluated).toBeInstanceOf(value.Vector)
				const elements = (evaluated as value.Vector).elements
				expect(elements).toHaveLength(expected.length)
				expected.forEach((e, i) => testIntValue(elements[i], e))
			})
		} else if (typeof expected === 'string') {
			test(`'${input}' should throw an error with message "${expected}"`, () => {
				testError(evaluated, expected)
			})
		}
	}
})

test('vector literals', () => {
	const input = '[1, 2 * 2, 3 + 3]'
	const evaluated = testEval(input)

	expect(evaluated).toBeInstanceOf(value.Vector)

	const vec = evaluated as value.Vector
	expect(vec.elements).toHaveLength(3)
	testIntValue(vec.elements[0], 1)
	testIntValue(vec.elements[1], 4)
	testIntValue(vec.elements[2], 6)
})

describe('vector index expressions', () => {
	runTest('[1, 2, 3][0]', 1)
	runTest('[1, 2, 3][1]', 2)
	runTest('let i = 0; [1][i]', 1)
	runTest('[1, 2, 3][1 + 1]', 3)
	runTest('let myArray = [1, 2, 3]; myArray[2]', 3)
	runTest('let myArray = [1, 2, 3]; myArray[0] + myArray[1] + myArray[2]', 6)
	runTest('let myArray = [1, 2, 3]; let i = myArray[0]; myArray[i]', 2)
	runTest('[1, 2, 3][3]', null)
	runTest('[1, 2, 3][-1]', null)

	runTest('{"foo": 5}["foo"]', 5)
	runTest('{"foo": 5}["bar"]', null)
	runTest('let key = "foo"; {"foo": 5}[key]', 5)
	runTest('{}["foo"]', null)
	runTest('{5: 5}[5]', 5)
	runTest('{true: 5}[true]', 5)
	runTest('{false: 5}[false]', 5)

	function runTest(input: string, expected: number | null) {
		test(`'${input}' equals to ${expected}`, () => {
			const evaluated = testEval(input)

			if (expected === null) {
				testNullValue(evaluated)
			} else {
				testIntValue(evaluated, expected)
			}
		})
	}
})

test('dict literals', () => {
	const input = `
{
	"one": 10 - 9,
	"two": 1 + 1,
	"thr" + "ee": 6 / 2,
	4: 4,
	true: 5,
	false: 6
}`

	const expected = new Map<string, number>([
		[new value.Str('one').dictKey(), 1],
		[new value.Str('two').dictKey(), 2],
		[new value.Str('three').dictKey(), 3],
		[new value.Int(4).dictKey(), 4],
		[new value.Bool(true).dictKey(), 5],
		[new value.Bool(false).dictKey(), 6],
	])

	const evaluated = testEval(input)

	if (!(evaluated instanceof value.Dict)) throw new Error()

	expect(evaluated.pairs.size).toBe(expected.size)

	evaluated.pairs.forEach((val, key) => {
		const expectedValue = expected.get(key)
		if (!expectedValue) throw new Error()

		testIntValue(val, expectedValue)
	})
})

function testEval(input: string): value.Value {
	const l = new Lexer(input)
	const p = new Parser(l)

	const program = p.parseProgram()
	const env = new value.Env()
	return evaluate(program, env)
}

function testIntValue(val: value.Value, expected: number) {
	expect(val).toBeInstanceOf(value.Int)

	const bool = val as value.Int

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

function testError(val: value.Value, expectedMessage: string) {
	expect(val).toBeInstanceOf(value.Error)
	expect((val as value.Error).message).toBe(expectedMessage)
}
