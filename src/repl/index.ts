import repl from 'repl'

import {evaluate} from '../evaluator'
import {Lexer} from '../lexer'
import {Parser} from '../parser'

export function start() {
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

			const evaluated = evaluate(program)

			const err = msg !== '' ? new Error(msg) : null

			cb(err, evaluated.inspect())
		},
	})
}
