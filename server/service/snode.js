return {
	findOneById(key, queries){
		queries.push({
			index: ['d', 0],
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
