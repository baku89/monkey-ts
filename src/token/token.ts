export enum TokenType {
	ILLEGAL = 'ILLEGAL',
	EOF = 'EOF',

	// Identifier + Literals
	IDENT = 'IDENT',
	INT = 'INT',

	// Oerators
	ASSIGN = '=',
	PLUS = '+',

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
