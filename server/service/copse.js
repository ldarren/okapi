return {
	payload(record, output){
		const payload = this.crdt.prototype.stringify(record)
		Object.assign(output, {payload})
		return this.next()
	},
	fRecord2CRDT(record, crdt){
		const d = record.d
		crdt['data'] = d[1]
		if (d.length > 2) crdt['child'] = d[2]
		return this.next()
	},
}
