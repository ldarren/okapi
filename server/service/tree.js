return {
	meta(ip, output){
		Object.assign(output, {host_ip: ip[0]})
		return this.next()
	},
	query_by_key(key, query){
		Object.assign(query, {
			index: ['d', 'key'],
			csv: [key]
		})
		return this.next()
	},
	query_by_creator(cby, query){
		Object.assign(query, {
			index: ['cby'],
			csv: [cby]
		})
		return this.next()
	}
}
