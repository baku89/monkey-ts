export enum TokenType {
	ILLEGAL = 'ILLEGAL',
	EOF = 'EOF',

	// Identifier + Literals
	IDENT = 'IDENT',
	INT = 'INT',
	STR = 'STR',

	// Oerators
	ASSIGN = '=',
	PLUS = '+',
	MINUS = '-',
	BANG = '!',
	ASTERISK = '*',
	SLASH = '/',

	LT = '<',
	GT = '>',

	EQ = '==',
	NOT_EQ = '!=',

	// Delimiters
	COMMA = ',',
	SEMICOLON = ';',

	LPAREN = '(',
	RPAREN = ')',
	LBRACE = '{',
	RBRACE = '}',
	LBRACKET = '[',
	RBRACKET = ']',

	// Keywords
	FUNCTION = 'FUNCTION',
	LET = 'LET',
	TRUE = 'TRUE',
	FALSE = 'FALSE',
	IF = 'IF',
	ELSE = 'ELSE',
	RETURN = 'RETURN',
}

export interface Token {
	type: TokenType
	literal: string
}

const keywords = new Map<string, TokenType>([
	['fn', TokenType.FUNCTION],
	['let', TokenType.LET],
	['true', TokenType.TRUE],
	['false', TokenType.FALSE],
	['if', TokenType.IF],
	['else', TokenType.ELSE],
	['return', TokenType.RETURN],
])

export function lookupIdent(literal: string): TokenType {
	return keywords.get(literal) ?? TokenType.IDENT
}
