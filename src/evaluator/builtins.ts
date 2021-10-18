import * as value from '../value'

export const builtins = new Map<string, value.Builtin>([
	[
		'len',
		new value.Builtin((...args: value.Value[]) => {
			if (args.length !== 1) {
				const msg = `wrong number of arguments. expected=1, got=${args.length}`
				return new value.Error(msg)
			}

			const arg = args[0]

			if (arg.type === 'str') {
				return new value.Int(arg.value.length)
			}

			const msg = `argument to \`len\` not supported, got=${arg.type}`
			return new value.Error(msg)
		}),
	],
])
