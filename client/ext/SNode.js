const Callback = require('po/Callback')
const CRDT = require('ext/CRDT')

function onCRDTChange(type, changes){
	switch(type){
	case CRDT.UPDATE:
		break
	case CRDT.COMMAND:
		break
	}
}

function onPush(type, ref, data){
	switch(type){
	case SNode.REFPUSH:
		if (ref === this.data().org){
			if (data.id === this.id){
				this.crdt.serverPush(ref, data)
			}else{
				this.callback.trigger(SNode.ROOMPUSH, ref, data)
			}
		}else{
			this.callback.trigger(type, ref, data)
		}
		break
	case SNode.ROOMPUSH:
		if (data.id === this.id) {
			this.crdt.serverPush(ref, data)
		}else{
			this.callback.trigger(type, ref, data)
		}
		break
	}
}

function mapChilds(seed){
	const ret = {}
	if (!seed || !Array.isArray(seed) || 3 > seed.length) return ret
	const childs = seed[2]
	if (!childs || !Array.isArray(childs)) return ret
	return childs.reduce((acc, c) => {
		acc[c[0]] = c
		return acc
	}, ret)
}

function SNode(ref, id, host, net, seeds){
	this.callback = new Callback
	this.id = id
	this.ref = ref // pass down from previous snode, not store in CRDT
	this.host = host

	this.crdt = new CRDT(this, ref, id, net, seeds)

	// render from cache/feEdge
	const child = this.crdt.child()
	this.isInner = Array.isArray(child)
	if (this.isInner){
		ref = this.data().org || ref
		const map = mapChilds(seeds)
		this.child = child.map(id => new SNode(ref, id, this, net, map[id]) )
	}

	this.crdt.callback.on(CRDT.UPDATE, onCRDTChange, this)
	this.crdt.callback.on(CRDT.COMMAND, onCRDTChange, this)
	if (this.isInner){
		this.host.callback.on(SNode.REFPUSH, onPush, this)
	}
	this.host.callback.on(SNode.ROOMPUSH, onPush, this)
}

SNode.ADD = 'add'
SNode.UPDATE = 'upd'
SNode.DELETE = 'del'
SNode.CHANGE = 'cha'
SNode.REFPUSH = 'rfp'
SNode.ROOMPUSH = 'rmp'

SNode.prototype = {
	join(){
		return [this.id, this.data, this.child ? this.child.map(c => c.join()) : void 0]
	},
	data(){
		return this.crdt.data()
	},
	clear(){
		return this.crdt.clear()
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
		if (!Array.isArray(this.child)) return
		return this.child[index]
	},
	insert(index, tree, ref){
		if (!this.isInner) return
		ref = this.data().org || ref
		this.move(index, new SNode(ref, tree[0], this, this.crdt.net, tree))
	},
	move(index, snode){
		if (!Array.isArray(this.child)) return
		if (-1 < index) this.child.splice(index, 0, snode)
		else this.child.push(snode)
		this.callback.trigger(SNode.ADD, snode, index)
		this.host.callback.trigger(SNode.CHANGE, SNode.ADD, snode, index, this)
		this.crdt.updateChild(index, 0, snode.id)
	},
	remove(){
		const host = this.host
		if (!host) return
		host.splice(this.id)
	},
	splice(id){
		const index = this.findIndex(id)
		if (-1 === index) return
		return this.spliceByIndex(index)
	},
	spliceByIndex(idx){
		const [snode] = this.child.splice(idx, 1)
		this.callback.trigger(SNode.DELETE, snode)
		this.host.callback.trigger(SNode.CHANGE, SNode.DELETE, snode, this)
		this.crdt.updateChild(idx, 1)
		snode.crdt.clear()
		return snode
	},
	update(data){
		if (!this.crdt.updateData(data)) return
		this.callback.trigger(SNode.UPDATE, this)
		this.host.callback.trigger(SNode.CHANGE, SNode.UPDATE, this)
	},
	resetChilds(ref, rem, add){
		rem.forEach(idx => this.spliceByIndex(idx))
		for (let idx in add){
			this.insert(parseInt(idx), [add[idx]], ref)
		}
	}
}

return SNode
