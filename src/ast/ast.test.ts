import {TokenType} from '../token'
import {Identifier, Let, Program} from '.'

test('Test string', () => {
	const program = new Program([
		new Let(
			{type: TokenType.LET, literal: 'let'},
			new Identifier({type: TokenType.IDENT, literal: 'myVar'}, 'myVar'),
			new Identifier(
				{type: TokenType.IDENT, literal: 'anotherVar'},
				'anotherVar'
			)
		),
	])

	expect(program.toString()).toBe('let myVar = anotherVar;')
})
