import * as value from '../value'
import {NULL} from '.'

export const builtins = new Map<string, value.Builtin>([
	[
		'len',
		new value.Builtin((...args) => {
			if (args.length !== 1) {
				return createWrongNumberOfArgumentError(args, 1)
			}

			const arg = args[0]

			switch (arg.type) {
				case 'str':
					return new value.Int(arg.value.length)
				case 'vector':
					return new value.Int(arg.elements.length)
			}

			const msg = `argument to \`len\` not supported, got=${arg.type}`
			return new value.Error(msg)
		}),
	],
	[
		'first',
		new value.Builtin((...args) => {
			if (args.length !== 1) {
				return createWrongNumberOfArgumentError(args, 1)
			}

			const vec = args[0]

			if (vec.type !== 'vector') {
				const msg = `argument to \`last\` must be vector, got ${vec.type})`
				return new value.Error(msg)
			}

			return vec.elements[0] ?? NULL
		}),
	],
	[
		'last',
		new value.Builtin((...args) => {
			if (args.length !== 1) {
				return createWrongNumberOfArgumentError(args, 1)
			}

			const vec = args[0]

			if (vec.type !== 'vector') {
				const msg = `argument to \`last\` must be vector, got ${vec.type})`
				return new value.Error(msg)
			}

			const l = vec.elements.length - 1
			return vec.elements[l] ?? NULL
		}),
	],
	[
		'rest',
		new value.Builtin((...args) => {
			if (args.length !== 1) {
				return createWrongNumberOfArgumentError(args, 1)
			}

			const vec = args[0]

			if (vec.type !== 'vector') {
				const msg = `argument to \`last\` must be vector, got ${vec.type})`
				return new value.Error(msg)
			}

			if (vec.elements.length === 0) {
				return NULL
			}

			return new value.Vector(vec.elements.slice(1))
		}),
	],
	[
		'push',
		new value.Builtin((...args) => {
			if (args.length !== 2) {
				return createWrongNumberOfArgumentError(args, 2)
			}

			const [vec, el] = args

			if (vec.type !== 'vector') {
				const msg = `argument to \`last\` must be vector, got ${vec.type})`
				return new value.Error(msg)
			}

			return new value.Vector([...vec.elements, el])
		}),
	],
])

function createWrongNumberOfArgumentError(args: any[], expected: number) {
	const msg = `wrong number of arguments. expected=${expected}, got=${args.length}`
	return new value.Error(msg)
}
