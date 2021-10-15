import * as ast from '../ast'
import {Lexer} from '../lexer'
import {Parser} from '.'

test('Let statements', () => {
	const input = `
let x = 5;
let y = 10;
let foobar = 838383;
`

	const l = new Lexer(input)
	const p = new Parser(l)

	const program = p.parseProgram()

	checkParserErrors(p)

	expect(program.statements).toHaveLength(3)

	const tests = ['x', 'y', 'foobar']

	tests.forEach((tt, i) => {
		const stmt = program.statements[i]
		testLetStatement(stmt, tt)
	})
})

function testLetStatement(s: ast.Statement, name: string) {
	expect(s.tokenLiteral()).toBe('let')

	expect(s).toBeInstanceOf(ast.LetStatement)

	expect((s as ast.LetStatement).name.value).toBe(name)

	expect((s as ast.LetStatement).name.tokenLiteral()).toBe(name)
}

function checkParserErrors(p: Parser) {
	expect(p.errors).toHaveLength(0)
}

test('Return statements', () => {
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

	program.statements.forEach(stmt => {
		expect(stmt).toBeInstanceOf(ast.ReturnStatement)
		expect(stmt.tokenLiteral()).toBe('return')
	})
})

test('Identifier expression', () => {
	const input = 'foobar;'

	const l = new Lexer(input)
	const p = new Parser(l)

	const program = p.parseProgram()
	checkParserErrors(p)

	expect(program.statements).toHaveLength(1)

	const stmt = program.statements[0]

	expect(stmt).toBeInstanceOf(ast.ExpressionStatement)

	const expr = (stmt as ast.ExpressionStatement).expression

	expect(expr).toBeInstanceOf(ast.Identifier)
	expect((expr as ast.Identifier).value).toBe('foobar')
	expect((expr as ast.Identifier).tokenLiteral()).toBe('foobar')
})

test('Integer literal expression', () => {
	const input = '5;'

	const l = new Lexer(input)
	const p = new Parser(l)

	const program = p.parseProgram()
	checkParserErrors(p)

	expect(program.statements).toHaveLength(1)

	const stmt = program.statements[0]

	expect(stmt).toBeInstanceOf(ast.ExpressionStatement)

	const exp = (stmt as ast.ExpressionStatement).expression

	expect(exp).toBeInstanceOf(ast.IntegerLiteral)
	expect((exp as ast.IntegerLiteral).value).toBe(5)
	expect((exp as ast.IntegerLiteral).tokenLiteral()).toBe('5')
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
		const l = new Lexer(input)
		const p = new Parser(l)

		const program = p.parseProgram()
		checkParserErrors(p)

		expect(program.statements).toHaveLength(1)

		const stmt = program.statements[0]

		expect(stmt).toBeInstanceOf(ast.ExpressionStatement)

		const exp = (stmt as ast.ExpressionStatement).expression

		expect(exp).toBeInstanceOf(ast.PrefixExpression)

		const prefix = exp as ast.PrefixExpression

		expect(prefix.operator).toBe(operator)
		testLiteralExpression(prefix.right, expected)
	}
})

function testLiteralExpression(exp: ast.Expression, expected: any) {
	switch (typeof expected) {
		case 'number':
			return testIntegerLiteral(exp, expected)
		case 'boolean':
			return testBooleanLiteral(exp, expected)
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
	expect(exp).toBeInstanceOf(ast.InfixExpression)

	const opExp = exp as ast.InfixExpression

	testLiteralExpression(opExp.left, left)
	expect(opExp.operator).toBe(operator)
	testLiteralExpression(opExp.right, right)
}

function testIdentifier(exp: ast.Expression, value: string) {
	expect(exp).toBeInstanceOf(ast.Identifier)

	const ident = exp as ast.Identifier

	expect(ident.value).toBe(value)
	expect(ident.tokenLiteral()).toBe(value)
}

function testIntegerLiteral(il: ast.Expression, value: number) {
	expect(il).toBeInstanceOf(ast.IntegerLiteral)

	const integ = il as ast.IntegerLiteral

	expect(integ.value).toBe(value)
	expect(integ.tokenLiteral()).toBe(value.toString())
}

function testBooleanLiteral(exp: ast.Expression, value: boolean) {
	expect(exp).toBeInstanceOf(ast.BooleanLiteral)

	const bool = exp as ast.BooleanLiteral

	expect(bool.value).toBe(value)
	expect(bool.tokenLiteral()).toBe(value.toString())
}

test('Parsing infix expressions', () => {
	testParsingInfixExpression('5 + 5', 5, '+', 5)
	testParsingInfixExpression('5 - 5', 5, '-', 5)
	testParsingInfixExpression('5 * 5', 5, '*', 5)
	testParsingInfixExpression('5 / 5', 5, '/', 5)
	testParsingInfixExpression('5 > 5', 5, '>', 5)
	testParsingInfixExpression('5 < 5', 5, '<', 5)
	testParsingInfixExpression('5 == 5', 5, '==', 5)
	testParsingInfixExpression('5 != 5', 5, '!=', 5)
	testParsingInfixExpression('true == true', true, '==', true)
	testParsingInfixExpression('true != false', true, '!=', false)
	testParsingInfixExpression('false == false', false, '==', false)

	function testParsingInfixExpression(
		input: string,
		leftValue: number | boolean,
		operator: string,
		rightValue: number | boolean
	) {
		const l = new Lexer(input)
		const p = new Parser(l)

		const program = p.parseProgram()
		checkParserErrors(p)

		expect(program.statements).toHaveLength(1)

		const stmt = program.statements[0]

		expect(stmt).toBeInstanceOf(ast.ExpressionStatement)

		const exp = (stmt as ast.ExpressionStatement).expression

		expect(exp).toBeInstanceOf(ast.InfixExpression)

		const infix = exp as ast.InfixExpression

		testLiteralExpression(infix.left, leftValue)
		expect(infix.operator).toBe(operator)
		testLiteralExpression(infix.right, rightValue)
	}
})

test('Operator precedence parsing', () => {
	testOperatorPrecedenceParsing('-a * b', '((-a) * b)')
	testOperatorPrecedenceParsing('!-a', '(!(-a))')
	testOperatorPrecedenceParsing('a + b + c', '((a + b) + c)')
	testOperatorPrecedenceParsing('a * b * c', '((a * b) * c)')
	testOperatorPrecedenceParsing('a * b / c', '((a * b) / c)')
	testOperatorPrecedenceParsing('a + b / c', '(a + (b / c))')
	testOperatorPrecedenceParsing(
		'a + b * c + d / e - f',
		'(((a + (b * c)) + (d / e)) - f)'
	)
	testOperatorPrecedenceParsing('3 + 4; -5 * 5', '(3 + 4)((-5) * 5)')
	testOperatorPrecedenceParsing('5 > 4 == 3 < 4', '((5 > 4) == (3 < 4))')
	testOperatorPrecedenceParsing('5 > 4 != 3 > 4', '((5 > 4) != (3 > 4))')
	testOperatorPrecedenceParsing(
		'3 + 4 * 5 == 3 * 4 + 4 * 5',
		'((3 + (4 * 5)) == ((3 * 4) + (4 * 5)))'
	)
	testOperatorPrecedenceParsing('true', 'true')
	testOperatorPrecedenceParsing('false', 'false')
	testOperatorPrecedenceParsing('3 > 5 == false', '((3 > 5) == false)')
	testOperatorPrecedenceParsing('3 < 5 == true', '((3 < 5) == true)')

	function testOperatorPrecedenceParsing(input: string, expected: string) {
		const l = new Lexer(input)
		const p = new Parser(l)

		const program = p.parseProgram()
		checkParserErrors(p)

		const actual = program.toString()
		expect(actual).toBe(expected)
	}
})

test('boolean expressions', () => {
	testBooleanExpression('true;', true)
	testBooleanExpression('false;', false)

	function testBooleanExpression(input: string, expected: boolean) {
		const l = new Lexer(input)
		const p = new Parser(l)

		const program = p.parseProgram()
		checkParserErrors(p)

		expect(program.statements).toHaveLength(1)
		expect(program.statements[0]).toBeInstanceOf(ast.ExpressionStatement)

		const stmt = program.statements[0] as ast.ExpressionStatement

		expect(stmt.expression).toBeInstanceOf(ast.BooleanLiteral)
		expect((stmt.expression as ast.BooleanLiteral).value).toBe(expected)
	}
})
