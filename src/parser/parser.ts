import {Identifier, LetStatement, Program} from '../ast'
import {Lexer} from '../lexer'
import {Token, TokenType} from '../token'

export class Parser {
	public lexer: Lexer
	public curToken!: Token
	public peekToken!: Token

	public constructor(lexer: Lexer) {
		this.lexer = lexer

		this.nextToken()
		this.nextToken()
	}

	public parseProgram(): Program {
		const program = new Program()

		while (this.curToken.type !== TokenType.EOF) {
			const stmt = this.parseStatement()
			if (stmt) program.statements.push(stmt)
			this.nextToken()
		}

		return program
	}

	private parseStatement() {
		switch (this.curToken.type) {
			case TokenType.LET:
				return this.parseLetStatement()
			default:
				return null
		}
	}

	private parseLetStatement() {
		const token = this.curToken

		if (!this.expectPeek(TokenType.IDENT)) {
			return null
		}

		const name = new Identifier(this.curToken, this.curToken.literal)

		if (!this.expectPeek(TokenType.ASSIGN)) {
			return null
		}

		// TODO: セミコロンに遭遇するまで式を読み飛ばしてしまっている
		while (!this.curTokenIs(TokenType.SEMICOLON)) {
			this.nextToken()
		}

		return new LetStatement(token, name)
	}

	private curTokenIs(tt: TokenType) {
		return this.curToken.type == tt
	}

	private peekTokenIs(tt: TokenType) {
		return this.peekToken.type == tt
	}

	private expectPeek(tt: TokenType) {
		if (this.peekTokenIs(tt)) {
			this.nextToken()
			return true
		} else {
			return false
		}
	}

	private nextToken() {
		this.curToken = this.peekToken
		this.peekToken = this.lexer.nextToken()
	}
}
