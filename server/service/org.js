return {
	selectOldestCreator(ref, user){
		const qs = []
		qs.push({
			index: ['d', 'ref'],
			csv: [ref]
		},{
			index: ['s'],
			csv: [1]
		})
		const oldest = this.db.org.select(qs).sort((a, b) => a.cat - b.cat).pop()
		if (oldest){
			user.i = oldest.cby
		}
		return this.next()
	},
}
