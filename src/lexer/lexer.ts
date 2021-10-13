import {lookupIdent, Token, TokenType} from '../token'

function isLetter(ch: string) {
	return /^[a-z]$/i.test(ch)
}

function isDigit(ch: string) {
	return /^[0-9]$/.test(ch)
}

export class Lexer {
	public input: string
	public position!: number // 入力における現在位置
	public readPosition!: number // これから読み込む位置（現在の文字の次）
	public ch!: string

	public constructor(input: string) {
		this.input = input

		// Initialize position, readPosition, and ch
		this.readPosition = 0
		this.readChar()
	}

	public nextToken(): Token {
		let tok: Token

		this.skipWhitespace()

		switch (this.ch) {
			case '=':
				tok = {type: TokenType.ASSIGN, literal: this.ch}
				break
			case ';':
				tok = {type: TokenType.SEMICOLON, literal: this.ch}
				break
			case '(':
				tok = {type: TokenType.LPAREN, literal: this.ch}
				break
			case ')':
				tok = {type: TokenType.RPAREN, literal: this.ch}
				break
			case ',':
				tok = {type: TokenType.COMMA, literal: this.ch}
				break
			case '+':
				tok = {type: TokenType.PLUS, literal: this.ch}
				break
			case '{':
				tok = {type: TokenType.LBRACE, literal: this.ch}
				break
			case '}':
				tok = {type: TokenType.RBRACE, literal: this.ch}
				break
			case '':
				tok = {type: TokenType.EOF, literal: this.ch}
				break
			default:
				if (isLetter(this.ch)) {
					const literal = this.readIdentifier()
					const type = lookupIdent(literal)
					tok = {
						literal,
						type,
					}
					return tok
				} else if (isDigit(this.ch)) {
					tok = {
						type: TokenType.INT,
						literal: this.readNumber(),
					}
					return tok
				} else {
					tok = {
						type: TokenType.ILLEGAL,
						literal: this.ch,
					}
				}
				break
		}

		this.readChar()

		return tok
	}

	private readChar() {
		if (this.readPosition >= this.input.length) {
			this.ch = ''
		} else {
			this.ch = this.input[this.readPosition]
		}
		this.position = this.readPosition
		this.readPosition += 1
	}

	private readIdentifier(): string {
		const position = this.position
		while (isLetter(this.ch)) {
			this.readChar()
		}
		return this.input.slice(position, this.position)
	}

	private readNumber(): string {
		const position = this.position
		while (isDigit(this.ch)) {
			this.readChar()
		}
		return this.input.slice(position, this.position)
	}

	private skipWhitespace() {
		while (/\s/.test(this.ch)) {
			this.readChar()
		}
	}
}
