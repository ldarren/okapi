const storage=window.localStorage

function toString(ctx){
	if (ctx.child) return JSON.stringify([ctx.id, ctx.data, ctx.child.map(c => c.id) ])
	return JSON.stringify([ctx.id, ctx.data])
}

function get(ctx){
	let ret
	const key = ctx.key
	if (!key) return ret
	try{
		const json=storage.getItem(key)
		if (json) ret = JSON.parse(json)
	}catch(ex){
		storage.removeItem(key)
	}
	return ret
}

function set(ctx){
	const key = ctx.key
	if (!key) return
	storage.setItem(key, toString(ctx))
}

function reset(ctx){
	const key = ctx.key
	if (!key) return
	storage.removeItem(key)
}

function unroll(seed){
	if (!seed || !Array.isArray(seed) || 2 > seed.length) return
	if (2 < seed.length){
		return [seed[0], seed[1], seed[2].map(c => c[0])]
	}
	return seed.slice()
}

function defRoot(id, data = {name: 'untitled'}, child = []){
	return [id, data, child]
}

function CRDT(ctx, ref, key, net, seed){
	this.ctx = ctx
	this.key = key
	this.net = net

	let node = get(this) || unroll(seed) || defRoot(key)
	this.id = node[0]
	this.data = node[1]
	this.child = node[2]

	this.dataDiff = Automerge.from(this.data)
	this.dataDiff.on('changes', () => {
	})
	if (this.child) {
		this.childDiff = Automerge.from(this.child)
		this.childDiff.on('changes', () => {
		})
	}

	set(this)

	this.sync(ref)
}

CRDT.prototype = {
	sync(ref){
		this.net.request('GET', `/1.0/tree/${this.id}`, {ref}, null, (err, xhr) => {
			if (err) return console.error(err)
			if (!xhr) return // new data
			const [id, body, child] = xhr.body
			if (id !== this.id) return console.error(`invalid id ${id}`)
			this.dataDiff.applyChanges(data)
			if (this.childDiff){
				this.childDiff.appliChanges(child)
			}else{
				this.childDiff = Automerge.from(child)
				this.childDiff.on('changes', () => {
				})
			}
		})
	},
	updateData(){
	},
	updateChild(){
	}
}

return CRDT

/* old references
	create(tree){
		let url
		if ('root' === this.meta.id){
			url = `${this.domain}/1.0/user/${this.userId}/tree`
		}else{
			url = `${this.domain}/1.0/tree/${this.meta.data.ref}`
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
*/
