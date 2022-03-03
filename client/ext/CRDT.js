function request(ctx, method, url, body, cb){
	pico.ajax(method, url, body, ctx.option, (err, state, xhr) => {
		if (state < 4) return
		cb(err, xhr)
	})
}

/*
 * CRDT Class
 * TODO: should pass in entire node? [id, meta, data], root id is root
 * TODO: should saved sapling with user id?
 */
function CRDT(meta, env, init = [], userId){
	this.meta = meta
	this.domain = env.domain
	this.userId = userId
	this.option = {
		headers: {
			Authorization: env.cred
		}
	}
	this.create(init)
}

CRDT.prototype = {
	init(spec){},
	fini(){},

	create(tree){
		let url
		if ('root' === this.meta.id){
			url = `${this.domain}/1.0/user/${this.userId}/tree`
		}else{
			url = `${this.domain}/1.0/tree/${this.meta.data.key}`
		}
		request(this, 'GET', url, null, (err, xhr) => {
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
