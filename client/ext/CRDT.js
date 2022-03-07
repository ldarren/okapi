function CRDT(init, net){
	this.doc = Automerge.from(init)
	this.net = net
}

CRDT.prototype = {
	create(tree){
		let url
		if ('root' === this.meta.id){
			url = `${this.domain}/1.0/user/${this.userId}/tree`
		}else{
			url = `${this.domain}/1.0/tree/${this.meta.data.key}`
		}
		this.net.request(this, 'GET', url, null, (err, xhr) => {
			if (err) return console.error(err)
			this.update(xhr)
		})
		this.doc = Automerge.from({tree})
	},
	update(changes){
		console.log('server receive ######', changes)
		if (!changes) return
		// receive same changes from upstream
		try{
			const [merge2, patch] = Automerge.applyChanges(merge, changes)
			console.log('server merge2', patch.diffs.props, merge2.req.toString())
			if (Object.keys(patch.diffs.props).length){
				const update = Automerge.getChanges(merge, merge2)
				WorkerModule.master.update(update)
			}
			merge = merge2
		}catch(ex){
			console.error(ex)
		}
	},
}

return CRDT
