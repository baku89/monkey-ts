import * as ast from '../ast'
import {Lexer} from '../lexer'
import {Token, TokenType} from '../token'

type PrefixParseFn = () => ast.Expression | null
type InfixParseFn = (left: ast.Expression) => ast.Expression | null

enum Priority {
	LOWEST = 0,
	EQUALS,
	LESSGREATER,
	SUM,
	PRODUCT,
	PREFIX,
	CALL,
}

export class Parser {
	public lexer: Lexer
	public curToken!: Token
	public peekToken!: Token
	public errors: string[] = []

	private prefixParseFns = new Map<TokenType, PrefixParseFn>()
	private infixParseFns = new Map<TokenType, InfixParseFn>()

	public constructor(lexer: Lexer) {
		this.lexer = lexer

		this.nextToken()
		this.nextToken()

		this.registerPrefix(TokenType.IDENT, this.parseIdentifier)
		this.registerPrefix(TokenType.INT, this.parseIntegerLiteral)
	}

	public parseProgram(): ast.Program {
		const program = new ast.Program()

		while (!this.curTokenIs(TokenType.EOF)) {
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
			case TokenType.RETURN:
				return this.parseReturnStatement()
			default:
				return this.parseExpressionStatement()
		}
	}

	private parseLetStatement() {
		const token = this.curToken

		if (!this.expectPeek(TokenType.IDENT)) {
			return null
		}

		const name = new ast.Identifier(this.curToken, this.curToken.literal)

		if (!this.expectPeek(TokenType.ASSIGN)) {
			return null
		}

		// TODO: セミコロンに遭遇するまで式を読み飛ばしてしまっている
		while (!this.curTokenIs(TokenType.SEMICOLON)) {
			this.nextToken()
		}

		return new ast.LetStatement(token, name)
	}

	private parseReturnStatement() {
		const token = this.curToken

		// TODO: セミコロンに遭遇するまで式を読み飛ばしてしまっている
		while (!this.curTokenIs(TokenType.SEMICOLON)) {
			this.nextToken()
		}

		return new ast.ReturnStatement(token)
	}

	private parseExpressionStatement() {
		const token = this.curToken
		const expression = this.parseExpression(Priority.LOWEST)

		if (this.peekTokenIs(TokenType.SEMICOLON)) {
			this.nextToken()
		}

		return new ast.ExpressionStatement(token, expression)
	}

	private parseExpression(priority: Priority): ast.Expression | null {
		const prefix = this.prefixParseFns.get(this.curToken.type)

		if (!prefix) return null

		const leftExp = prefix.call(this)
		return leftExp
	}

	private parseIdentifier(): ast.Expression {
		return new ast.Identifier(this.curToken, this.curToken.literal)
	}

	private parseIntegerLiteral(): ast.Expression | null {
		const token = this.curToken

		const value = parseInt(token.literal)

		if (isNaN(value)) {
			const msg = `Could not parse ${token.literal} as integer`
			this.errors.push(msg)
			return null
		}

		return new ast.IntegerLiteral(token, value)
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
			this.peekError(tt)
			return false
		}
	}

	private nextToken() {
		this.curToken = this.peekToken
		this.peekToken = this.lexer.nextToken()
	}

	private peekError(tt: TokenType) {
		const msg = `Expected next token to be ${tt}, got ${this.peekToken.type} instead`
		this.errors.push(msg)
	}

	private registerPrefix(tt: TokenType, fn: PrefixParseFn) {
		this.prefixParseFns.set(tt, fn)
	}

	private registerInfix(tt: TokenType, fn: InfixParseFn) {
		this.infixParseFns.set(tt, fn)
	}
}
