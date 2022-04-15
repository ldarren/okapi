return {
	payload(record, output){
		const payload = this.crdt.prototype.stringify(record)
		Object.assign(output, {payload})
		return this.next()
	},
	async router(method, params){
		const idx = params.id ? '/id' : ''
		const name = `${method}/chat${idx}`
		await this.next(null, name)
		return this.next()
	}
}
