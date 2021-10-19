import * as ast from '../ast'
import * as value from '../value'

export type Value =
	| Int
	| Str
	| Bool
	| Null
	| Return
	| Fn
	| Vector
	| Dict
	| Builtin
	| Error

export type DictKeyable = Int | Str | Bool

export class Int {
	public constructor(public value: number) {}

	public type: 'int' = 'int'

	public inspect(): string {
		return this.value.toString()
	}

	public dictKey(): string {
		return 'int:' + this.value.toString()
	}
}

export class Str {
	public constructor(public value: string) {}

	public type: 'str' = 'str'

	public inspect(): string {
		return '"' + this.value + '"'
	}

	public dictKey(): string {
		return 'str:' + this.value
	}
}

export class Bool {
	public constructor(public value: boolean) {}

	public type: 'bool' = 'bool'

	public inspect() {
		return this.value ? 'true' : 'false'
	}

	public dictKey(): string {
		return 'bool:' + this.value.toString()
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

export class Vector {
	public type: 'vector' = 'vector'

	public constructor(public elements: Value[]) {}

	public inspect(): string {
		const elements = this.elements.map(e => e.inspect()).join(', ')
		return '[' + elements + ']'
	}
}

export class Dict {
	public type: 'dict' = 'dict'

	public constructor(public pairs: Map<string, Value>) {}

	public inspect(): string {
		const entries = [...this.pairs.entries()]
			.map(([k, v]) => this.inspectDictKey(k) + ': ' + v.toString())
			.join(', ')
		return '{' + entries + '}'
	}

	private inspectDictKey(dict: string) {
		const [type, literal] = dict.split(':')
		switch (type) {
			case 'str':
				return '"' + literal + '"'
			default:
				return JSON.parse(literal).toString()
		}
	}
}

export type BuiltinFunction = (...args: Value[]) => Value

export class Builtin {
	public type: 'builtin' = 'builtin'

	public constructor(public fn: BuiltinFunction) {}

	public inspect(): string {
		return '<built-in function>'
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
