const pObj = require('pico/obj')

return {
	findOneById(key, queries){
		queries.push({
			index: ['d', 0],
			csv: [key]
		})
		return this.next()
	},
	async hasRef(method, params, input, record, output){
		const id = pObj.dot(record, ['d', 0], params.id)
		const ref = pObj.dot(record, ['d', 1, 'ref'], input.ref)
		if (!id || !ref) {
			Object.assign(output, record)
			return this.next()
		}
		Object.assign(this.data, {copse: {id: `${id}@${ref}`}})
		await this.next(null, `${method}/copse/id`)
		return this.next()
	},
}
