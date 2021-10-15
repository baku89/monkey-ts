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

const Precedences = new Map<TokenType, Priority>([
	[TokenType.EQ, Priority.EQUALS],
	[TokenType.NOT_EQ, Priority.EQUALS],
	[TokenType.LT, Priority.LESSGREATER],
	[TokenType.GT, Priority.LESSGREATER],
	[TokenType.PLUS, Priority.SUM],
	[TokenType.MINUS, Priority.SUM],
	[TokenType.SLASH, Priority.PRODUCT],
	[TokenType.ASTERISK, Priority.PRODUCT],
])

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
		this.registerPrefix(TokenType.TRUE, this.parseBooleanLiteral)
		this.registerPrefix(TokenType.FALSE, this.parseBooleanLiteral)
		this.registerPrefix(TokenType.BANG, this.parsePrefixExpression)
		this.registerPrefix(TokenType.MINUS, this.parsePrefixExpression)

		this.registerInfix(TokenType.PLUS, this.parseInfixExpression)
		this.registerInfix(TokenType.MINUS, this.parseInfixExpression)
		this.registerInfix(TokenType.SLASH, this.parseInfixExpression)
		this.registerInfix(TokenType.ASTERISK, this.parseInfixExpression)
		this.registerInfix(TokenType.EQ, this.parseInfixExpression)
		this.registerInfix(TokenType.NOT_EQ, this.parseInfixExpression)
		this.registerInfix(TokenType.LT, this.parseInfixExpression)
		this.registerInfix(TokenType.GT, this.parseInfixExpression)
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

	private parseExpression(precedence: Priority): ast.Expression | null {
		const prefix = this.prefixParseFns.get(this.curToken.type)

		if (!prefix) {
			this.noPrefixParseFnError(this.curToken.type)
			return null
		}

		let leftExp = prefix.call(this)

		while (!this.peekTokenIs(TokenType.SEMICOLON)) {
			if (precedence >= this.peekPrecedence()) break
			if (!leftExp) throw new Error()

			const infix = this.infixParseFns.get(this.peekToken.type)
			if (!infix) return leftExp

			this.nextToken()

			leftExp = infix.call(this, leftExp)
		}

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

	private parseBooleanLiteral(): ast.Expression | null {
		return new ast.BooleanLiteral(
			this.curToken,
			this.curTokenIs(TokenType.TRUE)
		)
	}

	private parsePrefixExpression(): ast.Expression | null {
		const token = this.curToken
		const operator = token.literal

		this.nextToken()

		const right = this.parseExpression(Priority.PREFIX)

		if (!right) throw new Error()

		return new ast.PrefixExpression(token, operator, right)
	}

	private parseInfixExpression(left: ast.Expression) {
		const token = this.curToken
		const operator = token.literal

		const precedence = this.curPrecedence()
		this.nextToken()
		const right = this.parseExpression(precedence)

		if (!right) throw new Error()

		return new ast.InfixExpression(token, left, operator, right)
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

	private noPrefixParseFnError(tt: TokenType) {
		const msg = `No prefix parse function for ${tt} found`
		this.errors.push(msg)
	}

	private registerPrefix(tt: TokenType, fn: PrefixParseFn) {
		this.prefixParseFns.set(tt, fn)
	}

	private registerInfix(tt: TokenType, fn: InfixParseFn) {
		this.infixParseFns.set(tt, fn)
	}

	private peekPrecedence(): Priority {
		return Precedences.get(this.peekToken.type) ?? Priority.LOWEST
	}

	private curPrecedence(): Priority {
		return Precedences.get(this.curToken.type) ?? Priority.LOWEST
	}
}
