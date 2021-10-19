import {Bool, Int, Str} from '../value'

type Hashable = Str | Int | Bool
type HashablePrimitive = string | number | boolean

test('if hash key is unique', () => {
	runTest('hello world', 'hello world', true)
	runTest('foo', 'bar', false)
	runTest(4, 4, true)
	runTest(1, '1', false)
	runTest(0, '0', false)
	runTest(0, false, false)
	runTest(true, true, true)
	runTest(false, false, true)

	function runTest(
		a: HashablePrimitive,
		b: HashablePrimitive,
		expected: boolean
	) {
		let aValue, bValue: Hashable

		if (typeof a === 'string') aValue = new Str(a)
		else if (typeof a === 'number') aValue = new Int(a)
		else aValue = new Bool(a)

		if (typeof b === 'string') bValue = new Str(b)
		else if (typeof b === 'number') bValue = new Int(b)
		else bValue = new Bool(b)

		expect(aValue.hashKey() === bValue.hashKey()).toBe(expected)
	}
})
