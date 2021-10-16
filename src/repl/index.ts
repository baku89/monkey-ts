import repl from 'repl'

import {Lexer} from '../lexer'
import {Parser} from '../parser'

export function start() {
	repl.start({
		prompt: '>> ',
		eval(input, context, file, cb) {
			const l = new Lexer(input)
			const p = new Parser(l)

			const program = p.parseProgram()

			let err: Error | null = null

			if (p.errors.length > 0) {
				const msg = p.errors.join('\n')
				err = new Error(msg)
			}

			cb(err, program.toString())
		},
	})
}
