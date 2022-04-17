return {
	payload(record, output){
		const payload = this.crdt.prototype.stringify(record)
		Object.assign(output, {payload})
		return this.next()
	},
	fRecord2CRDT(record, crdt){
		const d = record.d
		Object.assign(crdt, {
			data: d[1],
			child: d[2]
		})
		return this.next()
	},
	async router(method, params){
		const idx = params.id ? '/id' : ''
		const name = `${method}/copse${idx}`
		await this.next(null, name)
		return this.next()
	}
}
