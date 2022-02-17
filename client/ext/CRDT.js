/*
 * CRDT Class
 */
function CRDT(){
}

CRDT.prototype = {
	init(spec){},
	fini(){},

	create(init){
		this.merge = Automerge.change(Automerge.init(), init)
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
	}
}

return CRDT
