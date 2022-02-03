return {
	async router(method, params){
		const idx = params.id ? '/id' : ''
		const name = `${method}/chat${idx}`
		await this.next(null, name)
		return this.next()
	}
}
