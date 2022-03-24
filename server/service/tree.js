return {
	meta(ip, output){
		Object.assign(output, {host_ip: ip[0]})
		return this.next()
	},
	query_by_id(id, query){
		query.push({
			index: ['d', 0],
			csv: [id]
		})
		return this.next()
	},
	query_by_creator(cby, query){
		query.push({
			index: ['cby'],
			csv: [cby]
		}, {
			index: ['d', 't'],
			csv: ['ROOT']
		})
		return this.next()
	}
}
