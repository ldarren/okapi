const pObj = require('pico/obj')
const pArr = require('pico/arr')
const Callback = require('po/Callback')
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
	const {data, child} = ctx.feEdge
	storage.setItem(key, JSON.stringify(doc2Node(key, data, child)))
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

function node2Doc(node){
	if (!Array.isArray(node)) throw `invalid node ${node}`
	return 2 < node.length ? {data: node[1], child: node[2]} : {data: node[1]}
}

function doc2Node(id, data, child){
	return child ? [id, data, child] : [id, data]
}

function sse(changes){
	const [merge, patch] = Automerge.applyChanges(this.beEdge, changes)
	this.beEdge = merge
	this.feEdge = Automerge.merge(this.feEdge, this.beEdge)
	this.callback.trigger(CRDT.COMMAND, patch)
}

function CRDT(host, ref, key, net, seed){
	this.callback = new Callback
	this.host = host
	this.key = key
	this.net = net
	this.online = []
	let node = get(this) || unroll(seed) || [key, {name: 'untitled'}, []]
	this.feEdge = Automerge.from(node2Doc(node))

	const params = ref ? {ref} : null
	this.net.request('GET', `/1.0/snode/key/${key}`, params, null, (err, xhr) => {
		if (err) return console.error(err)
		if (!xhr) return console.error(`snode key[${key}] not found`)
		/*
		 * with ref, server returns node id and current online users
		 * without ref, server returns node data
		 */
		if (ref){
			this.online = pObj.dot(xhr, ['body', 'online'], this.online)
		}else{
			node = pObj.dot(xhr, ['body', 'd'])
			if (!node || !Array.isArray(node) || !node[0]) return
			const [rem, add] = pArr.diff(this.child(), node[2])
			this.feEdge = Automerge.from(node2Doc(node))
			set(this)
			host.resetChilds(ref, rem, add)
		}
	})
}

CRDT.RESET = 'rst'
CRDT.UPDATE = 'upd'
CRDT.COMMAND = 'cmd'

CRDT.prototype = {
	data(){
		return this.feEdge.data
	},
	child(){
		return this.feEdge.child
	},
	/*
	 * CRDT Sync
	 *
	 * @param {string} ref - CRDT room reference key
	 * @param {uInt8Array} changes - get from Automerge.getChanges(be, fe)
	 */
	sync(ref, changes){
		if (!ref || !changes) return
		this.net.request('PUT', `/1.0/copse/${ref}/node/key/${this.key}`, changes, null, (err, xhr) => {
			if (err) return console.error(err)
			this.feEdge = Automerge.applyChanges(this.feEdge, changes)
			set(this)
		})
	},
	/*
	 * force save without CRDT sync
	 *
	 * @param {uInt8Array} changes - get from Automerge.getChanges(be, fe)
	 */
	save(changes){
		if (changes){
			this.feEdge = Automerge.applyChanges(this.feEdge, changes)
		}
		const key = this.key
		const {data, child} = this.feEdge
		this.net.request('PUT', `/1.0/snode/key/${key}`, doc2Node(key, data, child), null, (err, xhr) => {
			if (err) return console.error(err)
			set(this)
		})
	},
	updateData(data){
		this.feEdge = Automerge.change(this.feEdge, doc => {
			pObj.extend(doc.data, data)
		})
		set(this)
	},
	updateChild(index, count, child){
		this.feEdge = Automerge.change(this.feEdge, doc => {
			let c = doc.child
			if (!Array.isArray(c)) {
				c = doc.child = []
			}
			if (null == index) c.push(child)
			else child ? c.splice(index, count, child) : c.splice(index, count)
		})

		set(this)
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
