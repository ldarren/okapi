const pObj = require('pico/obj')
const pArr = require('pico/arr')
const Callback = require('po/Callback')
const Sapling = require('ext/Sapling')
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

/**
 * Object that handle local cache, seed and CRDT operation, based on Automerge
 *
 * this object maintains 2 CRDT docs (feEdge and beEdge)
 * feEdge = beEdge + local changes
 * beEdge = sync with current connected peer
 */
function CRDT(host, ref, key, net, seed){
	this.callback = new Callback
	this.host = host
	this.key = key
	this.net = net
	this.online = []
	let node = 
		get(this) || // from cache
		unroll(seed) || // from config/seed
		(host.host instanceof Sapling ? [key, {name: 'root'}, []] : [key, {name: '/untitled'}]) // from default
	this.feEdge = Automerge.from(node2Doc(node))
	ref = this.feEdge.data.org || ref

	const params = ref ? {ref} : null
	/*
	 * same request with - without ref, server side may have ref/org update
	 * if with ref (either client or server) actual node data will be sending to serverPush 
	 */
	this.net.request('GET', `/1.0/snode/key/${key}`, params, null, (err, xhr) => {
		if (err) return console.error(err)
		if (!xhr) return console.error(`snode key[${key}] not found`)
		/*
		 * with ref, server returns node id and current online users, no actual node data
		 * without ref, server returns node data
		 */
		if (ref){
			this.online = pObj.dot(xhr, ['body', 'online'], this.online)
		}else{
			node = pObj.dot(xhr, ['body', 'd'])
			if (!node || !Array.isArray(node) || !node[0]) return
			const [rem, add] = pArr.diff(this.child(), node[2])
			this.beEdge = Automerge.from(node2Doc(node))
			this.feEdge = Automerge.clone(this.beEdge)
			set(this)
			host.resetChilds(ref, rem, add)
		}
	})
}

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
	 * SSE Push - when ref/org set on client or server side
	 *
	 * @param {string} ref - room ref
	 * @param {object} data - sse summary
	 * @param {string} data.type - getAllChanges or getChanges
	 * @param {array} data.changes - get from Automerge.getChanges(be, fe)
	 */
	serverPush(ref, data){
		const isAll = 'all' === data.type
		let oldChild
		if (isAll){
			oldChild = this.child()
			this.feEdge = Automerge.init()
			this.beEdge = Automerge.init()
		}else{
			this.feEdge = this.feEdge || Automerge.init()
			this.beEdge = this.beEdge || Automerge.init()
		}

		const [beMerge] = Automerge.applyChanges(this.beEdge, data.changes)
		this.beEdge = beMerge
		const [feMerge, patch] = Automerge.applyChanges(this.feEdge, data.changes)
		this.feEdge = feMerge
		set(this)

		if (isAll){
			const [rem, add] = pArr.diff(oldChild, this.child())
			this.host.resetChilds(ref, rem, add)
		}else{
			const props = patch.diffs.props
			if (!props.child) return
			const child = props.child
			const rem = [], add = {}
			for (let key in child){
				child[key].edits.forEach(diff => {
					switch (diff.action) {
					case 'insert':
						add[diff.index] = diff.value.value
						break
					case 'remove':
						rem.push(diff.index)
						break
					}
				})
			}
			this.host.resetChilds(ref, rem, add)
		}
		this.callback.trigger(CRDT.COMMAND, patch)
	},
	/*
	 * Save to server - with or without CRDT
	 *
	 */
	save(){
		set(this)
		const key = this.key
		const feEdge = this.feEdge
		const ref = feEdge.data.org || this.host.ref
		if (ref){
			const beEdge = this.beEdge
			const changes = Automerge.getChanges(beEdge, feEdge)
			this.net.request('PATCH', `/1.0/snode/${ref}/node/key/${key}`, changes, null, (err, xhr) => {
				if (err) return console.error(err)
				this.beEdge = Automerge.applyChanges(beEdge, changes)
			})
		}else{
			const {data, child} = feEdge
			this.net.request('PUT', `/1.0/snode/key/${key}`, doc2Node(key, data, child), null, (err, xhr) => {
				if (err) return console.error(err)
			})
		}
	},
	/*
	 * Handle org update differently
	 */
	updateData(data){
		const oldOrg = this.feEdge.data.org
		this.feEdge = Automerge.change(this.feEdge, doc => {
			pObj.extend(doc.data, data)
		})
		if (data.org !== oldOrg){
			if (!oldOrf){
				console.log('insert')
			}else if (!data.org){
				console.log('remove')
			}else{
				console.log('update', data.org)
			}
		}
		this.save()
		return true
	},
	updateChild(index, count, child){
		// outdated implementation, check updateData
		this.feEdge = Automerge.change(this.feEdge, doc => {
			let c = doc.child
			if (!Array.isArray(c)) {
				c = doc.child = []
			}
			if (null == index) c.push(child)
			else child ? c.splice(index, count, child) : c.splice(index, count)
		})
		this.save()
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
