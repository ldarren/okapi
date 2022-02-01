return {
	async router(method, params){
		const idx = params.i ? '/i' : ''
		const name = `${method}/chat${idx}`
		await this.next(null, name, Object.assign({
			params,
		}, this.data))
		return this.next()
	}
}
