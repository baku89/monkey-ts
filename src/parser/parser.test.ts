import {LetStatement, ReturnStatement, Statement} from '../ast'
import {Lexer} from '../lexer'
import {Parser} from './parser'

test('Test let statements', () => {
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

function testLetStatement(s: Statement, name: string) {
	expect(s.tokenLiteral()).toBe('let')

	expect(s).toBeInstanceOf(LetStatement)

	expect((s as LetStatement).name.value).toBe(name)

	expect((s as LetStatement).name.tokenLiteral()).toBe(name)
}

function checkParserErrors(p: Parser) {
	expect(p.errors).toHaveLength(0)
}

test('Test return statements', () => {
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
		expect(stmt).toBeInstanceOf(ReturnStatement)
		expect(stmt.tokenLiteral()).toBe('return')
	})
})
