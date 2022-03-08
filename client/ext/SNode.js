const Callback = require('po/Callback')
const CRDT = require('ext/CRDT')
const storage=window.localStorage

const getKey = key => ('snode:' + key)

function toString(ctx){
	if (ctx.child) return JSON.stringify([ctx.id, ctx.data, ctx.child.map(c => c.id) ])
	return JSON.stringify([ctx.id, ctx.data])
}

function get(ctx){
	let obj
	if (!ctx.key) return obj
	const key = ctx.key
	try{
		const json=storage.getItem(key)
		if (!json) return obj
		obj = JSON.parse(json)
	}catch(ex){
		storage.removeItem(key)
	}
	return obj
}

function set(ctx){
	if (!ctx.key) return
	storage.setItem(ctx.key, toString(ctx))
}

function unroll(seeds){
	return [seeds[0], seeds[1], seeds.length > 2 ? seeds[2].map(c => c[0]) : void 0]
}

function mapChilds(seeds){
	const childs = seeds[2]
	if (!childs) return {}
	return childs.reduce((acc, c) => {
		acc[c[0]] = c
		return acc
	}, {})
}

function onChange(type, ...args){
	switch(type){
	case SNode.ADD:
	case SNode.UPDATE:
	case SNode.DELETE:
		set(this)
		break
	case SNode.CHANGE:
		this.host.callback.trigger(type, ...args)
		break
	}
}

function SNode(key, host, net, seeds){
	this.callback = new Callback
	this.key = getKey(key)
	this.host = host

	let tree = get(this) || unroll(seeds)

	this.id = tree[0]
	this.data = tree[1]
	this.dataCRDT = new CRDT(this.data, net)
	if (tree[2]){
		const map = mapChilds(seeds)
		this.child = tree[2].map(id => new SNode(id, this, net, map[id]) )
		this.isInner = Array.isArray(this.child)
		this.childCRDT = new CRDT(tree[2], net)
	}

	set(this)

	this.callback.on(SNode.CHANGE, onChange, this)
}

SNode.ADD = 'add'
SNode.UPDATE = 'upd'
SNode.DELETE = 'del'
SNode.CHANGE = 'cha'

SNode.prototype = {
	join(){
		return [this.id, this.data, this.child ? this.child.map(c => c.join()) : void 0]
	},
	find(path, i = 0){
		if (path[0] !== this.id) return
		if (path.length === i + 1) return this
		if (!this.child) return
		i += 1
		this.child.find(c => c.find(path, i))
	},
	findIndex(id){
		if (!this.child) return
		return this.child.findIndex(c => id === c.id)
	},
	findById(id){
		if (id === this.id) return this
		const cs = this.child
		if (!cs) return
		for (let c, i=0, r; (c=cs[i]); i++){
			r = c.findById(id)
			if (r) return r
		}
	},
	findByData(spec, endNode){
		// TODO: recursive find node with matching spec or reach the endNode
		return this
	},
	getChild(index){
		if (!this.child) return
		return this.child[index]
	},
	insert(index, tree){
		if (!this.child) return
		this.move(index, new SNode(this, tree))
	},
	move(index, snode){
		if (!this.child) return
		if (-1 < index) this.child.splice(index, 0, snode)
		else this.child.push(snode)
		this.callback.trigger(SNode.ADD, snode)
		this.host.callback.trigger(SNode.CHANGE, SNode.ADD, snode, this)
	},
	remove(){
		const host = this.host
		const index = host.findIndex(this.id)
		const [snode] = host.child.splice(index, 1)
		host.callback.trigger(SNode.DELETE, snode)
		const hhost = host.host
		if (hhost && hhost.callback){
			hhost.callback.trigger(SNode.CHANGE, SNode.DELETE, snode, this)
		}
	},
	splice(id){
		const index = this.findIndex(id)
		if (-1 === index) return
		const [snode] = this.child.splice(index, 1)
		this.callback.trigger(SNode.DELETE, snode)
		this.host.callback.trigger(SNode.CHANGE, SNode.DELETE, snode, this)
		return snode
	},
	update(data){
		Object.assign(this.data, data)
		this.callback.trigger(SNode.UPDATE, this)
		this.host.callback.trigger(SNode.CHANGE, SNode.UPDATE, this)
	},
}

return SNode
