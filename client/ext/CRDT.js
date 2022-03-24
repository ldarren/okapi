const pObj = require('pico/obj')
const storage=window.localStorage

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
	const id = ctx.id
	const {data, child} = ctx.feEdge
	storage.setItem(ctx.key, JSON.stringify(child ? [id, data, child] : [id, data]))
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

function sse(changes){
	this.beEdge = Automerge.applyChanges(this.beEdge, changes)
	this.feEdge = Automerge.merge(this.feEdge, this.beEdge)
	this.host.callback.trigger(SNode.UPDATE)
}

function CRDT(host, ref, key, net, seed){
	this.host = host
	this.key = key
	this.net = net

	let node = get(this) || unroll(seed) || defRoot(key)
	this.id = node[0]

	this.feEdge = Automerge.from({data: node[1], child: node[2]})

	set(this)
	this.host.callback.trigger(SNode.UPDATE)

	this.pull(pObj.dot(this, ['data', 'ref']) || ref)
}

CRDT.prototype = {
	pull(ref){
		this.net.request('GET', `/1.0/tree/id/${this.id}`, {ref}, null, (err, xhr) => {
			if (err) return console.error(err)
			if (!xhr) return console.error(`tree id[${id}] not found`)
			const [id, data, child] = xhr.body
			if (id !== this.id) return console.error(`wrong tree, expecting ${this.id}, received ${id}`)

			this.beEdge = Automerge.from(node2Doc({data, child}))
			this.feEdge = Autommerge.merge(Automerge.init(), this.beEdge)

			set(this)
			this.host.callback.trigger(SNode.UPDATE)
		})
	},
	sync(){
		const changes = Automerge.getChanges(this.beEdge, this.feEdge)
		this.net.request('PUT', `/1.0/chat/key/${this.key}`, changes, null, (err, xhr) => {
			if (err) return console.error(err)
		})
	},
	updateData(data){
		this.feEdge = Automerge.change(this.feEdge, doc => {
			pObj.extend(doc.data, data)
		})
		set(this)
		this.sync()
	},
	updateChild(index, count, child){
		this.feEdge = Automerge.change(this.feEdge, doc => {
			let c = doc.child
			if (!Array.isArray(c)) {
				c = doc.child = []
			}
			c.splice(index, count, child)
		})

		set(this)
		this.sync()
	},
	clear(){
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
