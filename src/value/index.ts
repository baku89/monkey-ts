export type Value = Integer | Bool | Null

export class Integer {
	public constructor(public value: number) {}

	public type: 'integer' = 'integer'

	public inspect() {
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

	public inspect() {
		return 'null'
	}
}
