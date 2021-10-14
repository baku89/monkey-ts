import {LetStatement, Statement} from '../ast'
import {Lexer} from '../lexer'
import {Parser} from './parser'

test('Test let statement', () => {
	const input = `
let x = 5;
let y = 10;
let foobar = 838383;
`

	const l = new Lexer(input)
	const p = new Parser(l)

	const program = p.parseProgram()

	expect(program.statements.length).toBe(3)

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
