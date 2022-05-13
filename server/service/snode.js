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
		// ignored the ref in record, bcos at this point client side no ref yet
		const ref = input.ref
		if (!id || !ref) {
			Object.assign(output, record)
			return this.next()
		}
		Object.assign(this.data, {copse: {id: `${id}@${ref}`}})
		await this.next(null, `${method}/copse/id`)
		return this.next()
	},
	router: (key, postfix) => async function (method, params){
		const id = params[key] ? postfix : ''
		const name = `${method}/snode${id}`
		await this.next(null, name)
		return this.next()
	}
}
