import * as ast from '../ast'
import {Lexer} from '../lexer'
import {Parser} from '.'

test('let statements', () => {
	const input = `
let x = 5;
let y = 10;
let foobar = 838383;
`
	const program = testParseProgram(input)

	expect(program.statements).toHaveLength(3)

	const tests: {ident: string; value: number}[] = [
		{ident: 'x', value: 5},
		{ident: 'y', value: 10},
		{ident: 'foobar', value: 838383},
	]

	tests.forEach((tt, i) => {
		const stmt = program.statements[i]
		testLetStatement(stmt, tt.ident, tt.value)
	})
})

function testLetStatement(s: ast.Node, ident: string, value: number) {
	expect(s.tokenLiteral()).toBe('let')

	expect(s).toBeInstanceOf(ast.Let)

	const ls = s as ast.Let

	expect(ls.name.value).toBe(ident)

	expect(ls.name.tokenLiteral()).toBe(ident)

	testLiteral(ls.value as any, value)
}

function checkParserErrors(p: Parser) {
	expect(p.errors).toHaveLength(0)
}

test('return statements', () => {
	const input = `
return 5;
return 10;
return 993322;
`
	const l = new Lexer(input)
	const p = new Parser(l)

	const program = p.parseProgram()
	checkParserErrors(p)

	expect(program.statements).toHaveLength(3)

	const tests = [5, 10, 993322]

	tests.forEach((value, i) => {
		const stmt = program.statements[i]
		expect(stmt).toBeInstanceOf(ast.Return)
		expect(stmt.tokenLiteral()).toBe('return')
		testLiteral((stmt as ast.Return).returnValue, value)
	})
})

test('identifier expression', () => {
	const input = 'foobar;'

	const program = testParseProgram(input)
	const stmt = testProgramHasOneExpressionStatement(program)

	const expr = stmt.expression

	expect(expr).toBeInstanceOf(ast.Identifier)
	expect((expr as ast.Identifier).value).toBe('foobar')
	expect((expr as ast.Identifier).tokenLiteral()).toBe('foobar')
})

test('int literal expression', () => {
	const input = '5;'

	const program = testParseProgram(input)
	const stmt = testProgramHasOneExpressionStatement(program)

	const exp = stmt.expression

	expect(exp).toBeInstanceOf(ast.Int)
	expect((exp as ast.Int).value).toBe(5)
	expect((exp as ast.Int).tokenLiteral()).toBe('5')
})

test('parsing prefix expressions', () => {
	testParsingPrefixExpression('!5;', '!', 5)
	testParsingPrefixExpression('-15;', '-', 15)
	testParsingPrefixExpression('!true;', '!', true)
	testParsingPrefixExpression('!false;', '!', false)

	function testParsingPrefixExpression(
		input: string,
		operator: string,
		expected: number | boolean
	) {
		const program = testParseProgram(input)
		const stmt = testProgramHasOneExpressionStatement(program)

		const exp = stmt.expression

		expect(exp).toBeInstanceOf(ast.Prefix)

		const prefix = exp as ast.Prefix

		expect(prefix.operator).toBe(operator)
		testLiteral(prefix.right, expected)
	}
})

describe('parsing infix expressions', () => {
	runTest('5 + 5', 5, '+', 5)
	runTest('5 - 5', 5, '-', 5)
	runTest('5 * 5', 5, '*', 5)
	runTest('5 / 5', 5, '/', 5)
	runTest('5 > 5', 5, '>', 5)
	runTest('5 < 5', 5, '<', 5)
	runTest('5 == 5', 5, '==', 5)
	runTest('5 != 5', 5, '!=', 5)
	runTest('true == true', true, '==', true)
	runTest('true != false', true, '!=', false)
	runTest('false == false', false, '==', false)

	function runTest(
		input: string,
		leftValue: number | boolean,
		operator: string,
		rightValue: number | boolean
	) {
		const expected = `${leftValue} ${operator} ${rightValue}`
		test(`'${input}' to be parsed as ${expected}`, () => {
			const program = testParseProgram(input)
			const stmt = testProgramHasOneExpressionStatement(program)

			const exp = stmt.expression

			expect(exp).toBeInstanceOf(ast.Infix)

			const infix = exp as ast.Infix

			testLiteral(infix.left, leftValue)
			expect(infix.operator).toBe(operator)
			testLiteral(infix.right, rightValue)
		})
	}
})

describe('operator precedence parsing', () => {
	runTest('-a * b', '((-a) * b)')
	runTest('!-a', '(!(-a))')
	runTest('a + b + c', '((a + b) + c)')
	runTest('a * b * c', '((a * b) * c)')
	runTest('a * b / c', '((a * b) / c)')
	runTest('a + b / c', '(a + (b / c))')
	runTest('a + b * c + d / e - f', '(((a + (b * c)) + (d / e)) - f)')
	runTest('3 + 4; -5 * 5', '(3 + 4)((-5) * 5)')
	runTest('5 > 4 == 3 < 4', '((5 > 4) == (3 < 4))')
	runTest('5 > 4 != 3 > 4', '((5 > 4) != (3 > 4))')
	runTest(
		'3 + 4 * 5 == 3 * 4 + 4 * 5',
		'((3 + (4 * 5)) == ((3 * 4) + (4 * 5)))'
	)
	runTest('true', 'true')
	runTest('false', 'false')
	runTest('3 > 5 == false', '((3 > 5) == false)')
	runTest('3 < 5 == true', '((3 < 5) == true)')
	runTest('1 + (2 + 3) + 4', '((1 + (2 + 3)) + 4)')
	runTest('(5 + 5) * 2', '((5 + 5) * 2)')
	runTest('-(5 + 5)', '(-(5 + 5))')
	runTest('!(true == true)', '(!(true == true))')
	runTest('a * [1, 2, 3, 4][b * c] * d', '((a * ([1, 2, 3, 4][(b * c)])) * d)')
	runTest(
		'add(a * b[2], b[1], 2 * [1, 2][1])',
		'add((a * (b[2])), (b[1]), (2 * ([1, 2][1])))'
	)

	function runTest(input: string, expected: string) {
		test(`'${input}' to be parsed as ${expected}`, () => {
			const l = new Lexer(input)
			const p = new Parser(l)

			const program = p.parseProgram()
			checkParserErrors(p)

			const actual = program.toString()
			expect(actual).toBe(expected)
		})
	}
})

describe('bool expressions', () => {
	runTest('true;', true)
	runTest('false;', false)

	function runTest(input: string, expected: boolean) {
		test(`'${input}' to be parsed as ${expected}`, () => {
			const program = testParseProgram(input)
			const stmt = testProgramHasOneExpressionStatement(program)

			expect(stmt.expression).toBeInstanceOf(ast.Bool)
			expect((stmt.expression as ast.Bool).value).toBe(expected)
		})
	}
})

test('if expression', () => {
	const input = 'if (x < y) { x }'

	const program = testParseProgram(input)
	const stmt = testProgramHasOneExpressionStatement(program)

	expect(stmt.expression).toBeInstanceOf(ast.If)

	const exp = stmt.expression as ast.If

	testInfixExpression(exp.condition, 'x', '<', 'y')
	expect(exp.consequence.statements).toHaveLength(1)
	expect(exp.consequence.statements[0]).toBeInstanceOf(ast.ExpressionStatement)

	const consequence = exp.consequence.statements[0] as ast.ExpressionStatement

	testIdentifier(consequence.expression as ast.Expression, 'x')

	expect(exp.alternative).toBeUndefined()
})

test('if else expression', () => {
	const input = 'if (x < y) { x } else { y }'

	const program = testParseProgram(input)
	const stmt = testProgramHasOneExpressionStatement(program)

	expect(stmt.expression).toBeInstanceOf(ast.If)

	const exp = stmt.expression as ast.If

	testInfixExpression(exp.condition, 'x', '<', 'y')

	const {consequence} = exp

	expect(consequence.statements).toHaveLength(1)
	expect(consequence.statements[0]).toBeInstanceOf(ast.ExpressionStatement)

	const consequenceStmt = consequence.statements[0] as ast.ExpressionStatement

	testIdentifier(consequenceStmt.expression as ast.Expression, 'x')

	expect(exp.alternative).toBeInstanceOf(ast.Block)

	const alternative = exp.alternative as ast.Block

	expect(alternative.statements).toHaveLength(1)
	expect(alternative.statements[0]).toBeInstanceOf(ast.ExpressionStatement)

	const alternativeStmt = alternative.statements[0] as ast.ExpressionStatement

	testIdentifier(alternativeStmt.expression as ast.Expression, 'y')
})

test('function literal parsing', () => {
	const input = 'fn (x, y) { x + y; }'

	const program = testParseProgram(input)
	const stmt = testProgramHasOneExpressionStatement(program)

	expect(stmt.expression).toBeInstanceOf(ast.Fn)

	const fn = stmt.expression as ast.Fn

	expect(fn.parameters).toHaveLength(2)
	testLiteral(fn.parameters[0], 'x')
	testLiteral(fn.parameters[1], 'y')

	expect(fn.body.statements).toHaveLength(1)

	expect(fn.body.statements[0]).toBeInstanceOf(ast.ExpressionStatement)

	const bodyStmt = fn.body.statements[0] as ast.ExpressionStatement

	if (!bodyStmt.expression) throw new Error()

	testInfixExpression(bodyStmt.expression, 'x', '+', 'y')
})

describe('function parameter parsing', () => {
	runTest('fn () {}', [])
	runTest('fn (x) {}', ['x'])
	runTest('fn (x, y, z) {}', ['x', 'y', 'z'])

	function runTest(input: string, expectedParams: string[]) {
		const expected = '[' + expectedParams.join(',') + ']'
		test(`parameters of '${input}' to be parsed as ${expected}`, () => {
			const program = testParseProgram(input)
			const stmt = testProgramHasOneExpressionStatement(program)

			expect(stmt.expression).toBeInstanceOf(ast.Fn)

			const fn = stmt.expression as ast.Fn

			expect(fn.parameters).toHaveLength(expectedParams.length)

			fn.parameters.forEach((p, i) => testIdentifier(p, expectedParams[i]))
		})
	}
})

test('string literal expression', () => {
	const input = '"hello world"'

	const program = testParseProgram(input)
	const stmt = testProgramHasOneExpressionStatement(program)

	expect(stmt.expression).toBeInstanceOf(ast.Str)
	expect((stmt.expression as ast.Str).value).toBe('hello world')
})

function testParseProgram(input: string) {
	const l = new Lexer(input)
	const p = new Parser(l)

	const program = p.parseProgram()
	checkParserErrors(p)

	return program
}

function testProgramHasOneExpressionStatement(program: ast.Program) {
	expect(program.statements).toHaveLength(1)
	expect(program.statements[0]).toBeInstanceOf(ast.ExpressionStatement)

	return program.statements[0] as ast.ExpressionStatement
}

function testLiteral(exp: ast.Expression, expected: number | boolean | string) {
	switch (typeof expected) {
		case 'number':
			return testInt(exp, expected)
		case 'boolean':
			return testBool(exp, expected)
		case 'string':
			return testIdentifier(exp, expected)
		default:
			throw new Error(`Type of exp not handled. got=${typeof expected}`)
	}
}

function testInfixExpression(
	exp: ast.Expression,
	left: any,
	operator: string,
	right: any
) {
	expect(exp).toBeInstanceOf(ast.Infix)

	const opExp = exp as ast.Infix

	testLiteral(opExp.left, left)
	expect(opExp.operator).toBe(operator)
	testLiteral(opExp.right, right)
}

function testIdentifier(exp: ast.Expression, value: string) {
	expect(exp).toBeInstanceOf(ast.Identifier)

	const ident = exp as ast.Identifier

	expect(ident.value).toBe(value)
	expect(ident.tokenLiteral()).toBe(value)
}

function testInt(il: ast.Expression, value: number) {
	expect(il).toBeInstanceOf(ast.Int)

	const integ = il as ast.Int

	expect(integ.value).toBe(value)
	expect(integ.tokenLiteral()).toBe(value.toString())
}

function testBool(exp: ast.Expression, value: boolean) {
	expect(exp).toBeInstanceOf(ast.Bool)

	const bool = exp as ast.Bool

	expect(bool.value).toBe(value)
	expect(bool.tokenLiteral()).toBe(value.toString())
}

test('call expression parsing', () => {
	const input = 'add(1, 2 * 3, 4 + 5)'

	const program = testParseProgram(input)
	const stmt = testProgramHasOneExpressionStatement(program)

	expect(stmt.expression).toBeInstanceOf(ast.Call)

	const exp = stmt.expression as ast.Call

	testIdentifier(exp.fn, 'add')

	expect(exp.args).toHaveLength(3)

	testLiteral(exp.args[0], 1)
	testInfixExpression(exp.args[1], 2, '*', 3)
	testInfixExpression(exp.args[2], 4, '+', 5)
})

describe('call expression parameter parsing', () => {
	runTest('add();', 'add', [])
	runTest('add(1);', 'add', ['1'])
	runTest('add(1, 2 * 3, 4 + 5);', 'add', ['1', '(2 * 3)', '(4 + 5)'])

	function runTest(
		input: string,
		expectedIdent: string,
		expectedArgs: string[]
	) {
		const expectedArgsStr = '[' + expectedArgs.join(',') + ']'
		test(`'${input}' to be parsed as fn=${expectedIdent}, args=${expectedArgsStr}`, () => {
			const program = testParseProgram(input)
			const stmt = testProgramHasOneExpressionStatement(program)

			expect(stmt.expression).toBeInstanceOf(ast.Call)

			const exp = stmt.expression as ast.Call

			testIdentifier(exp.fn, expectedIdent)

			expect(exp.args).toHaveLength(expectedArgs.length)

			exp.args.forEach((p, i) => {
				expect(p.toString()).toBe(expectedArgs[i])
			})
		})
	}
})

test('parsing array literals', () => {
	const input = '[1, 2 * 2, 3 + 3]'

	const program = testParseProgram(input)
	const stmt = testProgramHasOneExpressionStatement(program)

	expect(stmt.expression).toBeInstanceOf(ast.Vector)

	const vec = stmt.expression as ast.Vector
	expect(vec.elements).toHaveLength(3)
	testInt(vec.elements[0], 1)
	testInfixExpression(vec.elements[1], 2, '*', 2)
	testInfixExpression(vec.elements[2], 3, '+', 3)
})

test('parsing index expresion', () => {
	const input = 'myArray[1 + 1]'

	const program = testParseProgram(input)
	const stmt = testProgramHasOneExpressionStatement(program)

	expect(stmt.expression).toBeInstanceOf(ast.Index)
	const ie = stmt.expression as ast.Index

	testIdentifier(ie.left, 'myArray')
	testInfixExpression(ie.index, 1, '+', 1)
})

describe('parsing hash literals', () => {
	type Expected = Map<string | number | boolean, (v: ast.Expression) => void>

	runTest(
		'parsing hash literal string keys',
		'{"one": 1, "two": 2, "three": 3}',
		new Map([
			['one', v => testInt(v, 1)],
			['two', v => testInt(v, 2)],
			['three', v => testInt(v, 3)],
		])
	)

	runTest(
		'parsing hash literal number/boolean keys',
		'{0: 1, 100: 2, false: 3}',
		new Map<string | number | boolean, (v: ast.Expression) => void>([
			[0, v => testInt(v, 1)],
			[100, v => testInt(v, 2)],
			[false, v => testInt(v, 3)],
		])
	)

	runTest(
		'parsing hash literal with expression',
		'{"one": 0 + 1, "two": 10 - 8, "three": 15 / 5}',
		new Map([
			['one', v => testInfixExpression(v, 0, '+', 1)],
			['two', v => testInfixExpression(v, 10, '-', 8)],
			['three', v => testInfixExpression(v, 15, '/', 5)],
		])
	)

	runTest('parsing empty hash literal', '{}', new Map())

	function runTest(name: string, input: string, expected: Expected) {
		test(name, () => {
			const program = testParseProgram(input)
			const stmt = testProgramHasOneExpressionStatement(program)

			expect(stmt.expression).toBeInstanceOf(ast.Hash)
			const hash = stmt.expression as ast.Hash

			expect(hash.pairs.size).toBe(expected.size)

			for (const [k, v] of hash.pairs) {
				if (k.type !== 'str' && k.type !== 'int' && k.type !== 'bool') {
					throw new Error()
				}

				const testValue = expected.get(k.value)

				if (!testValue) throw new Error()

				testValue(v)
			}
		})
	}
})
