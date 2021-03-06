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
	INDEX,
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
	[TokenType.LPAREN, Priority.CALL],
	[TokenType.LBRACKET, Priority.INDEX],
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
		this.registerPrefix(TokenType.INT, this.parseInt)
		this.registerPrefix(TokenType.TRUE, this.parseBool)
		this.registerPrefix(TokenType.FALSE, this.parseBool)
		this.registerPrefix(TokenType.STR, this.parseStr)
		this.registerPrefix(TokenType.BANG, this.parsePrefix)
		this.registerPrefix(TokenType.MINUS, this.parsePrefix)
		this.registerPrefix(TokenType.LPAREN, this.parseGroupedExpression)
		this.registerPrefix(TokenType.IF, this.parseIf)
		this.registerPrefix(TokenType.FUNCTION, this.parseFunctionLiteral)
		this.registerPrefix(TokenType.LBRACKET, this.parseVector)
		this.registerPrefix(TokenType.LBRACE, this.parseDict)

		this.registerInfix(TokenType.PLUS, this.parseInfix)
		this.registerInfix(TokenType.MINUS, this.parseInfix)
		this.registerInfix(TokenType.SLASH, this.parseInfix)
		this.registerInfix(TokenType.ASTERISK, this.parseInfix)
		this.registerInfix(TokenType.EQ, this.parseInfix)
		this.registerInfix(TokenType.NOT_EQ, this.parseInfix)
		this.registerInfix(TokenType.LT, this.parseInfix)
		this.registerInfix(TokenType.GT, this.parseInfix)
		this.registerInfix(TokenType.LPAREN, this.parseCallExpression)
		this.registerInfix(TokenType.LBRACKET, this.parseIndexExpression)
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
				return this.parseLet()
			case TokenType.RETURN:
				return this.parseReturnStatement()
			default:
				return this.parseExpressionStatement()
		}
	}

	private parseLet() {
		const token = this.curToken

		if (!this.expectPeek(TokenType.IDENT)) {
			return null
		}

		const name = new ast.Identifier(this.curToken, this.curToken.literal)

		if (!this.expectPeek(TokenType.ASSIGN)) {
			return null
		}

		this.nextToken()

		const value = this.parseExpression(Priority.LOWEST)

		if (!value) throw new Error()

		if (this.peekTokenIs(TokenType.SEMICOLON)) {
			this.nextToken()
		}

		return new ast.Let(token, name, value)
	}

	private parseReturnStatement() {
		const token = this.curToken

		this.nextToken()

		const returnValue = this.parseExpression(Priority.LOWEST)

		if (!returnValue) throw new Error()

		if (this.peekTokenIs(TokenType.SEMICOLON)) {
			this.nextToken()
		}

		return new ast.Return(token, returnValue)
	}

	private parseExpressionStatement() {
		const token = this.curToken
		const expression = this.parseExpression(Priority.LOWEST)

		if (!expression) throw new Error()

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

	private parseIdentifier() {
		return new ast.Identifier(this.curToken, this.curToken.literal)
	}

	private parseInt() {
		const token = this.curToken

		const value = parseInt(token.literal)

		if (isNaN(value)) {
			const msg = `Could not parse ${token.literal} as int`
			this.errors.push(msg)
			return null
		}

		return new ast.Int(token, value)
	}

	private parseStr() {
		return new ast.Str(this.curToken, this.curToken.literal)
	}

	private parseBool(): ast.Expression | null {
		return new ast.Bool(this.curToken, this.curTokenIs(TokenType.TRUE))
	}

	private parsePrefix(): ast.Expression | null {
		const token = this.curToken
		const operator = token.literal

		this.nextToken()

		const right = this.parseExpression(Priority.PREFIX)

		if (!right) throw new Error()

		return new ast.Prefix(token, operator, right)
	}

	private parseGroupedExpression(): ast.Expression | null {
		this.nextToken()

		const exp = this.parseExpression(Priority.LOWEST)

		if (!this.expectPeek(TokenType.RPAREN)) return null

		return exp
	}

	private parseIf(): ast.Expression | null {
		const token = this.curToken

		if (!this.expectPeek(TokenType.LPAREN)) return null

		this.nextToken()

		const condition = this.parseExpression(Priority.LOWEST)

		if (!condition) throw new Error()

		if (!this.expectPeek(TokenType.RPAREN)) return null

		if (!this.expectPeek(TokenType.LBRACE)) return null

		const consequence = this.parseBlockStatement()

		// Parse else statement
		let alternative: ast.Block | undefined = undefined
		if (this.peekTokenIs(TokenType.ELSE)) {
			this.nextToken()

			if (!this.expectPeek(TokenType.LBRACE)) return null

			alternative = this.parseBlockStatement()
		}

		return new ast.If(token, condition, consequence, alternative)
	}

	private parseFunctionLiteral(): ast.Expression | null {
		const token = this.curToken

		if (!this.expectPeek(TokenType.LPAREN)) return null

		const parameters = this.parseFunctionParameters()

		if (!this.expectPeek(TokenType.LBRACE)) return null

		const body = this.parseBlockStatement()

		return new ast.Fn(token, parameters, body)
	}

	private parseVector(): ast.Expression {
		const token = this.curToken
		const elements = this.parseExpressionList(TokenType.RBRACKET)
		return new ast.Vector(token, elements)
	}

	private parseDict(): ast.Expression {
		const token = this.curToken

		const pairs = new Map<ast.Expression, ast.Expression>()

		while (!this.peekTokenIs(TokenType.RBRACE)) {
			this.nextToken()
			const key = this.parseExpression(Priority.LOWEST)

			if (!this.expectPeek(TokenType.COLON)) {
				console.log(this.peekToken)
				throw new Error('Cannot parse dict')
			}

			this.nextToken()
			const value = this.parseExpression(Priority.LOWEST)

			if (!key || !value) {
				throw new Error('Cannot parse dict')
			}

			pairs.set(key, value)

			if (
				!this.peekTokenIs(TokenType.RBRACE) &&
				!this.expectPeek(TokenType.COMMA)
			) {
				throw new Error('Cannot parse dict')
			}
		}

		if (!this.expectPeek(TokenType.RBRACE)) {
			throw new Error('Cannot parse dict')
		}

		return new ast.Dict(token, new Map(pairs))
	}

	private parseFunctionParameters(): ast.Identifier[] {
		const identifiers: ast.Identifier[] = []

		if (this.peekTokenIs(TokenType.RPAREN)) {
			this.nextToken()
			return identifiers
		}

		this.nextToken()

		const ident = new ast.Identifier(this.curToken, this.curToken.literal)
		identifiers.push(ident)

		while (this.peekTokenIs(TokenType.COMMA)) {
			this.nextToken()
			this.nextToken()

			const ident = new ast.Identifier(this.curToken, this.curToken.literal)
			identifiers.push(ident)
		}

		if (!this.expectPeek(TokenType.RPAREN)) {
			throw new Error('Canot parse function parameters')
		}

		return identifiers
	}

	private parseExpressionList(end: TokenType): ast.Expression[] {
		const list: ast.Expression[] = []

		if (this.peekTokenIs(end)) {
			this.nextToken()
			return list
		}

		this.nextToken()

		const el = this.parseExpression(Priority.LOWEST)
		if (!el) throw new Error('Cannot parse an element of expression list')
		list.push(el)

		while (this.peekTokenIs(TokenType.COMMA)) {
			this.nextToken()
			this.nextToken()

			const el = this.parseExpression(Priority.LOWEST)
			if (!el) throw new Error('Cannot parse an element of expression list')
			list.push(el)
		}

		if (!this.expectPeek(end)) {
			throw new Error('Canot parse expression list')
		}

		return list
	}

	private parseBlockStatement(): ast.Block {
		const token = this.curToken

		this.nextToken()

		const block = new ast.Block(token)

		while (
			!this.curTokenIs(TokenType.RBRACE) &&
			!this.curTokenIs(TokenType.EOF)
		) {
			const stmt = this.parseStatement()
			if (stmt) block.statements.push(stmt)

			this.nextToken()
		}

		return block
	}

	private parseInfix(left: ast.Expression) {
		const token = this.curToken
		const operator = token.literal

		const precedence = this.curPrecedence()
		this.nextToken()
		const right = this.parseExpression(precedence)

		if (!right) throw new Error()

		return new ast.Infix(token, left, operator, right)
	}

	private parseCallExpression(fn: ast.Expression) {
		const token = this.curToken
		const args = this.parseCallArguments()
		return new ast.Call(token, fn, args)
	}

	private parseIndexExpression(left: ast.Expression) {
		const token = this.curToken
		this.nextToken()
		const index = this.parseExpression(Priority.LOWEST)

		if (!index) {
			throw new Error('Cannot parse index expression')
		}

		if (!this.expectPeek(TokenType.RBRACKET)) {
			throw new Error('Cannot parse index expression')
		}

		return new ast.Index(token, left, index)
	}

	private parseCallArguments(): ast.Expression[] {
		const args: ast.Expression[] = []

		if (this.peekTokenIs(TokenType.RPAREN)) {
			this.nextToken()
			return args
		}

		this.nextToken()
		const arg = this.parseExpression(Priority.LOWEST)
		if (!arg) throw new Error()
		args.push(arg)

		while (this.peekTokenIs(TokenType.COMMA)) {
			this.nextToken()
			this.nextToken()

			const arg = this.parseExpression(Priority.LOWEST)
			if (!arg) throw new Error()
			args.push(arg)
		}

		if (!this.expectPeek(TokenType.RPAREN)) {
			throw new Error()
		}

		return args
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
