import {Token} from 'src/token'

export interface Node {
	tokenLiteral(): string
}

export interface Statement extends Node {
	statementNode(): string
}

export interface Expression extends Node {
	expressionNode(): string
}

export class Program implements Node {
	public statements: Statement[] = []

	public tokenLiteral() {
		if (this.statements.length > 0) {
			return this.statements[0].tokenLiteral()
		} else {
			return ''
		}
	}
}

export class LetStatement implements Statement {
	public constructor(public token: Token, public name: Identifier) {}

	public tokenLiteral() {
		return this.token.literal
	}

	public statementNode() {
		return ''
	}
}

export class Identifier implements Expression {
	public constructor(public token: Token, public value: string) {}

	public tokenLiteral() {
		return this.token.literal
	}

	public expressionNode() {
		return ''
	}
}
