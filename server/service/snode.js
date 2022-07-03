const pObj = require('pico/obj')
const RAW = Symbol.for('raw')

return {
	findOneById(key, output){
		const qs = []
		qs.push({
			index: ['d', 0],
			csv: [key]
		})
		const record = this.db.snode.select(qs).pop()
		Object.assign(output, record)
		return this.next()
	},

	findOrg(org, output){
		const qs = []
		qs.push({
			index: ['d', 1, 'org'],
			csv: [org]
		},{
			index: ['s'],
			csv: [1]
		})
		const oldest = this.db.snode.select(qs).sort((a, b) => a.cat - b.cat).pop()
		Object.assign(output, oldest)
		return this.next()
	},

	findOneByIdAndUser(id, cby, output){
		const qs = []
		qs.push({
			index: ['d', 0],
			csv: [id]
		},{
			index: ['cby'],
			csv: [cby]
		},{
			index: ['s'],
			csv: [1]
		})
		const snode = this.db.snode.select(qs).pop()
		Object.assign(output, snode)
		return this.next()
	},

	/**
	 * if org present, ignore the given id, use the oldest creator id
	 */
	async detourIfHasOrg(method, id, input, record, output){
		const ref = pObj.dot(record, ['d', 1, 'org'], input.ref)
		if (!ref) {
			Object.assign(output, record)
			return this.next()
		}
		Object.assign(this.data, {org: {id, ref}})
		await this.next(null, `${method}/copse/ref`)
		return this.next()
	},

	/**
	 * if org present, replace snode, else save snode
	 */
	branchByOrg(org){
		if (!org.i) {
			return this.next(null, 'save/snode')
		}
		this.next(null, 'replace/snode')
	},

	bodyParser(body, output){
		const uint8arr = body.map(base64 => Uint8Array.from(atob(base64), c => c.charCodeAt(0)))
		output.push(...uint8arr)
		return this.next()
	},
}
