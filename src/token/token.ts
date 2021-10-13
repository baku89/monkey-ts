export enum TokenType {
	ILLEGAL = 'ILLEGAL',
	EOF = 'EOF',

	// Identifier + Literals
	IDENT = 'IDENT',
	INT = 'INT',

	// Oerators
	ASSIGN = '=',
	PLUS = '+',
	MINUS = '-',
	BANG = '!',
	ASTERISK = '*',
	SLASH = '/',

	LT = '<',
	GT = '>',

	// Delimiters
	COMMA = ',',
	SEMICOLON = ';',

	LPAREN = '(',
	RPAREN = ')',
	LBRACE = '{',
	RBRACE = '}',

	// Keywords
	FUNCTION = 'FUNCTION',
	LET = 'LET',
}

export interface Token {
	type: TokenType
	literal: string
}

export function lookupIdent(literal: string): TokenType {
	switch (literal) {
		case 'let':
			return TokenType.LET
		case 'fn':
			return TokenType.FUNCTION
		default:
			return TokenType.IDENT
	}
}
