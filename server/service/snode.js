return {
	findOneById(key, query){
		Object.assign(query, {
			index: ['d', 'id'],
			csv: [key]
		})
		return this.next()
	},
	async router(method, params){
		const key = params.key? '/key' : ''
		const name = `${method}/snode${key}`
		await this.next(null, name)
		return this.next()
	}
}
