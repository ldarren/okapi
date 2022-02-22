return {
	meta(ip, output){
		Object.assign(output, {host_ip: ip[0]})
		return this.next()
	},
	query_by_key(key, query){
		query.push({
			index: ['d', 'key'],
			csv: [key]
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
