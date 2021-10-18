import {Lexer} from '../lexer'
import {TokenType} from '../token'

test('Test next token', () => {
	const input = `let five = 5;
let ten = 10;

let add = fn(x, y) {
	x + y;
};

let result = add(five, ten);
!-/*5;
5 < 10 > 5;

if (5 < 10) {
	return true;
} else {
	return false;
}

10 == 10;
10 != 9;

"foobar"
"foo bar"
`

	const tests: {expectedType: TokenType; expectedLiteral: string}[] = [
		{expectedType: TokenType.LET, expectedLiteral: 'let'},
		{expectedType: TokenType.IDENT, expectedLiteral: 'five'},
		{expectedType: TokenType.ASSIGN, expectedLiteral: '='},
		{expectedType: TokenType.INT, expectedLiteral: '5'},
		{expectedType: TokenType.SEMICOLON, expectedLiteral: ';'},

		{expectedType: TokenType.LET, expectedLiteral: 'let'},
		{expectedType: TokenType.IDENT, expectedLiteral: 'ten'},
		{expectedType: TokenType.ASSIGN, expectedLiteral: '='},
		{expectedType: TokenType.INT, expectedLiteral: '10'},
		{expectedType: TokenType.SEMICOLON, expectedLiteral: ';'},

		{expectedType: TokenType.LET, expectedLiteral: 'let'},
		{expectedType: TokenType.IDENT, expectedLiteral: 'add'},
		{expectedType: TokenType.ASSIGN, expectedLiteral: '='},
		{expectedType: TokenType.FUNCTION, expectedLiteral: 'fn'},
		{expectedType: TokenType.LPAREN, expectedLiteral: '('},
		{expectedType: TokenType.IDENT, expectedLiteral: 'x'},
		{expectedType: TokenType.COMMA, expectedLiteral: ','},
		{expectedType: TokenType.IDENT, expectedLiteral: 'y'},
		{expectedType: TokenType.RPAREN, expectedLiteral: ')'},
		{expectedType: TokenType.LBRACE, expectedLiteral: '{'},
		{expectedType: TokenType.IDENT, expectedLiteral: 'x'},
		{expectedType: TokenType.PLUS, expectedLiteral: '+'},
		{expectedType: TokenType.IDENT, expectedLiteral: 'y'},
		{expectedType: TokenType.SEMICOLON, expectedLiteral: ';'},
		{expectedType: TokenType.RBRACE, expectedLiteral: '}'},
		{expectedType: TokenType.SEMICOLON, expectedLiteral: ';'},

		{expectedType: TokenType.LET, expectedLiteral: 'let'},
		{expectedType: TokenType.IDENT, expectedLiteral: 'result'},
		{expectedType: TokenType.ASSIGN, expectedLiteral: '='},
		{expectedType: TokenType.IDENT, expectedLiteral: 'add'},
		{expectedType: TokenType.LPAREN, expectedLiteral: '('},
		{expectedType: TokenType.IDENT, expectedLiteral: 'five'},
		{expectedType: TokenType.COMMA, expectedLiteral: ','},
		{expectedType: TokenType.IDENT, expectedLiteral: 'ten'},
		{expectedType: TokenType.RPAREN, expectedLiteral: ')'},
		{expectedType: TokenType.SEMICOLON, expectedLiteral: ';'},

		{expectedType: TokenType.BANG, expectedLiteral: '!'},
		{expectedType: TokenType.MINUS, expectedLiteral: '-'},
		{expectedType: TokenType.SLASH, expectedLiteral: '/'},
		{expectedType: TokenType.ASTERISK, expectedLiteral: '*'},
		{expectedType: TokenType.INT, expectedLiteral: '5'},
		{expectedType: TokenType.SEMICOLON, expectedLiteral: ';'},
		{expectedType: TokenType.INT, expectedLiteral: '5'},
		{expectedType: TokenType.LT, expectedLiteral: '<'},
		{expectedType: TokenType.INT, expectedLiteral: '10'},
		{expectedType: TokenType.GT, expectedLiteral: '>'},
		{expectedType: TokenType.INT, expectedLiteral: '5'},
		{expectedType: TokenType.SEMICOLON, expectedLiteral: ';'},

		{expectedType: TokenType.IF, expectedLiteral: 'if'},
		{expectedType: TokenType.LPAREN, expectedLiteral: '('},
		{expectedType: TokenType.INT, expectedLiteral: '5'},
		{expectedType: TokenType.LT, expectedLiteral: '<'},
		{expectedType: TokenType.INT, expectedLiteral: '10'},
		{expectedType: TokenType.RPAREN, expectedLiteral: ')'},
		{expectedType: TokenType.LBRACE, expectedLiteral: '{'},
		{expectedType: TokenType.RETURN, expectedLiteral: 'return'},
		{expectedType: TokenType.TRUE, expectedLiteral: 'true'},
		{expectedType: TokenType.SEMICOLON, expectedLiteral: ';'},
		{expectedType: TokenType.RBRACE, expectedLiteral: '}'},
		{expectedType: TokenType.ELSE, expectedLiteral: 'else'},
		{expectedType: TokenType.LBRACE, expectedLiteral: '{'},
		{expectedType: TokenType.RETURN, expectedLiteral: 'return'},
		{expectedType: TokenType.FALSE, expectedLiteral: 'false'},
		{expectedType: TokenType.SEMICOLON, expectedLiteral: ';'},
		{expectedType: TokenType.RBRACE, expectedLiteral: '}'},

		{expectedType: TokenType.INT, expectedLiteral: '10'},
		{expectedType: TokenType.EQ, expectedLiteral: '=='},
		{expectedType: TokenType.INT, expectedLiteral: '10'},
		{expectedType: TokenType.SEMICOLON, expectedLiteral: ';'},

		{expectedType: TokenType.INT, expectedLiteral: '10'},
		{expectedType: TokenType.NOT_EQ, expectedLiteral: '!='},
		{expectedType: TokenType.INT, expectedLiteral: '9'},
		{expectedType: TokenType.SEMICOLON, expectedLiteral: ';'},

		{expectedType: TokenType.STR, expectedLiteral: 'foobar'},
		{expectedType: TokenType.STR, expectedLiteral: 'foo bar'},

		{expectedType: TokenType.EOF, expectedLiteral: ''},
	]

	const l = new Lexer(input)

	for (const tt of tests) {
		const tok = l.nextToken()

		expect(tok.type).toBe(tt.expectedType)
		expect(tok.literal).toBe(tt.expectedLiteral)
	}
})
