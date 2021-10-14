import repl from 'repl'

import {Lexer} from '../lexer'
import {Token, TokenType} from '../token'

export function start() {
	repl.start({
		prompt: '>> ',
		eval(input, context, file, cb) {
			const l = new Lexer(input)

			const ret: Token[] = []

			for (
				let tok = l.nextToken();
				tok.type !== TokenType.EOF;
				tok = l.nextToken()
			) {
				ret.push(tok)
			}

			cb(null, ret)
		},
	})
}
