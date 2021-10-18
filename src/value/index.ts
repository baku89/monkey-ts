export type Value = Integer | Bool | Null | Return | Error

export class Integer {
	public constructor(public value: number) {}

	public type: 'integer' = 'integer'

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

export class Error {
	public type: 'error' = 'error'

	public constructor(public message: string) {}

	public inspect(): string {
		return `ERROR: ${this.message}`
	}
}

export class Env {
	public store = new Map<string, Value>()

	public get(name: string): Value | null {
		return this.store.get(name) ?? null
	}

	public set(name: string, val: Value): Value {
		this.store.set(name, val)
		return val
	}
}
