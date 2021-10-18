import * as ast from '../ast'
import * as value from '../value'

export type Value = Int | Bool | Null | Return | Fn | Error

export class Int {
	public constructor(public value: number) {}

	public type: 'int' = 'int'

	public inspect(): string {
		return this.value.toString()
	}
}

export class Bool {
	public constructor(public value: boolean) {}

	public type: 'bool' = 'bool'

	public inspect() {
		return this.value ? 'true' : 'false'
	}
}

export class Null {
	public type: 'null' = 'null'

	public inspect(): string {
		return 'null'
	}
}

export class Return {
	public type: 'return' = 'return'

	public constructor(public value: Value) {}

	public inspect(): string {
		return this.value.inspect()
	}
}

export class Fn {
	public type: 'fn' = 'fn'

	public constructor(
		public parameters: ast.Identifier[],
		public body: ast.Block,
		public env: value.Env
	) {}

	public inspect(): string {
		const params = this.parameters.map(p => p.toString()).join(', ')
		const body = this.body.toString()
		return `fn (${params}) {\n${body}\n}`
	}
}

export class Error {
	public type: 'error' = 'error'

	public constructor(public message: string) {}

	public inspect(): string {
		return `ERROR: ${this.message}`
	}
}

export class Env {
	public store = new Map<string, Value>()

	public constructor(public outer: Env | null = null) {}

	public get(name: string): Value | null {
		const val = this.store.get(name) ?? null
		if (!val && this.outer) return this.outer.get(name)
		return val
	}

	public set(name: string, val: Value): Value {
		this.store.set(name, val)
		return val
	}
}
