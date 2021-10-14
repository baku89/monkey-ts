import * as ast from '../ast'
import {Lexer} from '../lexer'
import {Parser} from './parser'

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

test('Parsing prefix expressions', () => {
	testPrefixExpression('!5;', '!', 5)
	testPrefixExpression('-15;', '-', 15)
})

function testPrefixExpression(
	input: string,
	operator: string,
	integerValue: number
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
	expect((exp as ast.PrefixExpression).operator).toBe(operator)

	testIntegerLiteral((exp as ast.PrefixExpression).right, integerValue)
}

function testIntegerLiteral(il: ast.Expression, value: number) {
	expect(il).toBeInstanceOf(ast.IntegerLiteral)

	const integ = il as ast.IntegerLiteral

	expect(integ.value).toBe(value)
	expect(integ.tokenLiteral()).toBe(value.toString())
}
