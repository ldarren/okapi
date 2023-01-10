const pObj = require('pico/obj')

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

	branchOrg(org, snode, member, output){
		// if same id join room
		if (pObj.dot(snode, ['d', 0]) === org.id){
			return this.next(null, 'copse/join', {snode, org, member, output})
		}
		return this.next()
	},
}
