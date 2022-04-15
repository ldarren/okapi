const pObj = require('pico/obj')

return {
	findOneById(key, queries){
		queries.push({
			index: ['d', 0],
			csv: [key]
		})
		return this.next()
	},
	async hasRef(method, meta, input, record, output){
		const id = pObj.dot(record, ['d', 0], meta.key)
		const ref = pObj.dot(record, ['d', 1, 'ref'], input.ref)
		if (!id || !ref) {
			await this.next(null, `${method}/copse`)
			return this.next()
		}
		await this.next(null, `${method}/copse/id`, {copse: {id: `${id}:${ref}`}, record, output})
		return this.next()
	},
	async router(method, params){
		const key = params.key? '/key' : ''
		const name = `${method}/snode${key}`
		await this.next(null, name)
		return this.next()
	}
}
