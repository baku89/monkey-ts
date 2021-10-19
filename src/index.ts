import * as ast from './ast'
import {evaluate} from './evaluator'
import {Lexer} from './lexer'
import {Parser} from './parser'
import * as value from './value'

function parse(input: string): ast.Program {
	const l = new Lexer(input)
	const p = new Parser(l)
	return p.parseProgram()
}

export {value, ast, evaluate, parse}
