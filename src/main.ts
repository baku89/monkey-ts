import os from 'os'

import * as repl from './repl'

function main() {
	console.log(
		`Hello ${os.userInfo().username}! This is the Monkey programming language!`
	)
	repl.start()
}

main()
