import {Token, TokenType} from '../token'

export class Lexer {
	public input: string
	public position!: number // 入力における現在位置
	public readPosition!: number // これから読み込む位置（現在の文字の次）
	public ch!: string | null

	public constructor(input: string) {
		this.input = input

		// Initialize position, readPosition, and ch
		this.readPosition = 0
		this.readChar()
	}

	public nextToken(): Token {
		let tok: Token

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
			default:
				tok = {type: TokenType.EOF, literal: ''}
				break
		}

		this.readChar()

		return tok
	}

	private readChar() {
		if (this.readPosition >= this.input.length) {
			this.ch = null
		} else {
			this.ch = this.input[this.readPosition]
		}
		this.position = this.readPosition
		this.readPosition += 1
	}
}
