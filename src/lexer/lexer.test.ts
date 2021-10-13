import {Lexer} from '../lexer'
import {TokenType} from '../token'

test('Test nextToken', () => {
	const input = '=+(){},;'

	const tests: {expectedType: TokenType; expectedLiteral: string}[] = [
		{expectedType: TokenType.ASSIGN, expectedLiteral: '='},
		{expectedType: TokenType.PLUS, expectedLiteral: '+'},
		{expectedType: TokenType.LPAREN, expectedLiteral: '('},
		{expectedType: TokenType.RPAREN, expectedLiteral: ')'},
		{expectedType: TokenType.LBRACE, expectedLiteral: '{'},
		{expectedType: TokenType.RBRACE, expectedLiteral: '}'},
		{expectedType: TokenType.COMMA, expectedLiteral: ','},
		{expectedType: TokenType.SEMICOLON, expectedLiteral: ';'},
	]

	const l = new Lexer(input)

	for (const tt of tests) {
		const tok = l.nextToken()

		expect(tok.type).toBe(tt.expectedType)
		expect(tok.literal).toBe(tt.expectedLiteral)
	}
})
