import {Token} from '../token'

export type Node = Program | Statement | Expression

type Statement =
	| LetStatement
	| ReturnStatement
	| ExpressionStatement
	| BlockStatement

export type Expression =
	| Identifier
	| PrefixExpression
	| InfixExpression
	| IfExpression
	| CallExpression
	| IntegerLiteral
	| BoolLiteral
	| FnLiteral

interface INode {
	tokenLiteral(): string
	toString(): string
}

interface IStatement extends INode {
	statementNode(): string
}

interface IExpression extends INode {
	expressionNode(): string
}

export class Program implements INode {
	public type: 'program' = 'program'

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

export class LetStatement implements IStatement {
	public type: 'letStatement' = 'letStatement'

	public constructor(
		public token: Token,
		public name: Identifier,
		public value: Expression
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

export class ReturnStatement implements IStatement {
	public type: 'returnStatement' = 'returnStatement'

	public constructor(public token: Token, public returnValue: Expression) {}

	public tokenLiteral() {
		return this.token.literal
	}

	public statementNode(): string {
		throw new Error('Not yet implemented')
	}

	public toString() {
		return `${this.tokenLiteral()} ${this.returnValue.toString()};`
	}
}

export class ExpressionStatement implements IStatement, IExpression {
	public type: 'expressionStatement' = 'expressionStatement'

	public constructor(public token: Token, public expression: Expression) {}

	public tokenLiteral() {
		return this.token.literal
	}

	public statementNode(): string {
		throw new Error('Not yet implemented')
	}

	public expressionNode(): string {
		throw new Error('Not yet implemented')
	}

	public toString() {
		return this.expression?.toString() ?? ''
	}
}

export class Identifier implements IExpression {
	public type: 'identifier' = 'identifier'

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

export class IntegerLiteral implements IExpression {
	public type: 'integerLiteral' = 'integerLiteral'

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

export class BoolLiteral implements IExpression {
	public type: 'boolLiteral' = 'boolLiteral'

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

export class FnLiteral implements IExpression {
	public type: 'fnLiteral' = 'fnLiteral'

	public constructor(
		public token: Token,
		public parameters: Identifier[],
		public body: BlockStatement
	) {}

	public tokenLiteral() {
		return this.token.literal
	}

	public expressionNode(): string {
		throw new Error('Not yet implemented')
	}

	public toString() {
		let str = this.tokenLiteral()
		str += '('
		str += this.parameters.map(s => s.toString()).join(', ')
		str += ')'
		str += this.body.toString()

		return str
	}
}

export class PrefixExpression implements IExpression {
	public type: 'prefixExpression' = 'prefixExpression'

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

	public toString(): string {
		return `(${this.operator}${this.right.toString()})`
	}
}

export class InfixExpression implements IExpression {
	public type: 'infixExpression' = 'infixExpression'

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

	public toString(): string {
		const left = this.left.toString()
		const op = this.operator
		const right = this.right.toString()
		return `(${left} ${op} ${right})`
	}
}

export class IfExpression implements IExpression {
	public type: 'ifExpression' = 'ifExpression'

	public constructor(
		public token: Token, // 'if' token
		public condition: Expression,
		public consequence: BlockStatement,
		public alternative?: BlockStatement
	) {}

	public tokenLiteral() {
		return this.token.literal
	}

	public expressionNode(): string {
		throw new Error('Not yet implemented')
	}

	public toString() {
		let str = `if ${this.condition} ${this.consequence}`

		if (this.alternative) {
			str += ` else ${this.alternative}`
		}

		return str
	}
}

export class BlockStatement {
	public type: 'blockStatement' = 'blockStatement'

	public constructor(
		public token: Token,
		public statements: Statement[] = []
	) {}

	public tokenLiteral() {
		return this.token.literal
	}

	public expressionNode(): string {
		throw new Error('Not yet implemented')
	}

	public toString(): string {
		return this.statements.map(s => s.toString()).join('')
	}
}

export class CallExpression implements IExpression {
	public type: 'callExpression' = 'callExpression'

	public constructor(
		public token: Token, // '(' token
		public fn: Expression, // Identifier or FunctionLiteral
		public args: Expression[]
	) {}

	public tokenLiteral() {
		return this.token.literal
	}

	public expressionNode(): string {
		throw new Error('Not yet implemented')
	}

	public toString(): string {
		let str = this.fn.toString()
		str += '('
		str += this.args.map(s => s.toString()).join(', ')
		str += ')'

		return str
	}
}
