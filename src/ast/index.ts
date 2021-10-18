import {Token} from '../token'

export type Node = Program | Statement | Expression

type Statement = Let | Return | ExpressionStatement | Block

export type Expression =
	| Identifier
	| Prefix
	| Infix
	| If
	| Call
	| Int
	| Str
	| Bool
	| Fn

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

export class Let implements IStatement {
	public type: 'let' = 'let'

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

export class Return implements IStatement {
	public type: 'return' = 'return'

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

export class Int implements IExpression {
	public type: 'int' = 'int'

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

export class Str implements IExpression {
	public type: 'str' = 'str'

	public constructor(public token: Token, public value: string) {}

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

export class Bool implements IExpression {
	public type: 'bool' = 'bool'

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

export class Fn implements IExpression {
	public type: 'fn' = 'fn'

	public constructor(
		public token: Token,
		public parameters: Identifier[],
		public body: Block
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

export class Prefix implements IExpression {
	public type: 'prefix' = 'prefix'

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

export class Infix implements IExpression {
	public type: 'infix' = 'infix'

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

export class If implements IExpression {
	public type: 'if' = 'if'

	public constructor(
		public token: Token, // 'if' token
		public condition: Expression,
		public consequence: Block,
		public alternative?: Block
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

export class Block {
	public type: 'block' = 'block'

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

export class Call implements IExpression {
	public type: 'call' = 'call'

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
