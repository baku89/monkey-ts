import {Token} from 'src/token'

export interface Node {
	tokenLiteral(): string
	toString(): string
}

export interface Statement extends Node {
	statementNode(): string
}

export interface Expression extends Node {
	expressionNode(): string
}

export class Program implements Node {
	public constructor(public statements: Statement[] = []) {}

	public tokenLiteral() {
		if (this.statements.length > 0) {
			return this.statements[0].tokenLiteral()
		} else {
			return ''
		}
	}

	public toString() {
		return this.statements.map(s => s.toString()).join('')
	}
}

export class LetStatement implements Statement {
	public constructor(
		public token: Token,
		public name: Identifier,
		public value: Expression | null = null
	) {}

	public tokenLiteral() {
		return this.token.literal
	}

	public statementNode(): string {
		throw new Error('Not yet implemented')
	}

	public toString() {
		return `${this.tokenLiteral()} ${this.name.toString()} = ${this.value?.toString()};`
	}
}

export class ReturnStatement implements Statement {
	public constructor(public token: Token) {}

	public tokenLiteral() {
		return this.token.literal
	}

	public statementNode(): string {
		throw new Error('Not yet implemented')
	}

	public toString() {
		return `${this.tokenLiteral()} <value>;`
	}
}

export class ExpressionStatement implements Statement {
	public constructor(
		public token: Token,
		public expression: Expression | null
	) {}

	public tokenLiteral() {
		return this.token.literal
	}

	public statementNode(): string {
		throw new Error('Not yet implemented')
	}

	public toString() {
		return this.expression?.toString() ?? ''
	}
}

export class Identifier implements Expression {
	public constructor(public token: Token, public value: string) {}

	public tokenLiteral() {
		return this.token.literal
	}

	public expressionNode(): string {
		throw new Error('Not yet implemented')
	}

	public toString() {
		return this.value
	}
}

export class IntegerLiteral implements Expression {
	public constructor(public token: Token, public value: number) {}

	public tokenLiteral() {
		return this.token.literal
	}

	public expressionNode(): string {
		throw new Error('Not yet implemented')
	}

	public toString() {
		return this.token.literal
	}
}

export class BooleanLiteral implements Expression {
	public constructor(public token: Token, public value: boolean) {}

	public expressionNode(): string {
		throw new Error('Not yet implemented')
	}

	public tokenLiteral() {
		return this.token.literal
	}

	public toString() {
		return this.token.literal
	}
}

export class PrefixExpression implements Expression {
	public constructor(
		public token: Token,
		public operator: string,
		public right: Expression
	) {}

	public tokenLiteral() {
		return this.token.literal
	}

	public expressionNode(): string {
		throw new Error('Not yet implemented')
	}

	public toString() {
		return `(${this.operator}${this.right.toString()})`
	}
}

export class InfixExpression implements Expression {
	public constructor(
		public token: Token,
		public left: Expression,
		public operator: string,
		public right: Expression
	) {}

	public tokenLiteral() {
		return this.token.literal
	}

	public expressionNode(): string {
		throw new Error('Not yet implemented')
	}

	public toString() {
		const left = this.left.toString()
		const op = this.operator
		const right = this.right.toString()
		return `(${left} ${op} ${right})`
	}
}
