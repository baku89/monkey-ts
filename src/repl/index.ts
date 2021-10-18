import repl from 'repl'

import {evaluate} from '../evaluator'
import {Lexer} from '../lexer'
import {Parser} from '../parser'
import {Env} from '../value'

export function start() {
	const env = new Env()

	repl.start({
		prompt: '>> ',
		eval(input, context, file, cb) {
			const l = new Lexer(input)
			const p = new Parser(l)

			const program = p.parseProgram()

			let msg = ''

			if (p.errors.length > 0) {
				msg = p.errors.join('\n')
			}

			const evaluated = evaluate(program, env)

			const err = msg !== '' ? new Error(msg) : null

			cb(err, evaluated.inspect())
		},
		writer: v => v,
	})
}
