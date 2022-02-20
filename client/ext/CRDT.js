function get(ctx, cb){
	const url = `${ctx.domain}/1.0/chat/${ctx.id}`
	pico.ajax('GET', url, null, ctx.option, (err, state, xhr) => {
		if (state < 4) return
		cb(err, xhr)
	})
}

function set(ctx, body){
	const url = `${ctx.domain}/1.0/chat/${ctx.id}`
	pico.ajax('PUT', url, body, ctx.option, (err, state, xhr) => {
		if (state < 4) return
		cb(err, xhr)
	})
}

/*
 * CRDT Class
 */
function CRDT(id, env){
	this.id = id
	this.domain = env.domain
	this.option = {
		headers: {
			Authorization: env.cred
		}
	}
}

CRDT.prototype = {
	init(spec){},
	fini(){},

	create(init){
		this.merge = Automerge.change(Automerge.init(), init)
		get(this, (err, xhr) => {
			if (err) return console.error(err)
			this.update(xhr)
		})
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
