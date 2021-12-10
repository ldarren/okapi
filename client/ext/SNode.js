const Callback=require('po/Callback')

function onChange(type, ...args){
	switch(type){
	case SNode.CHANGE:
		this.host.callback.trigger(type, ...args)
		break
	}
}

function SNode(host, tree){
	this.callback = new Callback
	this.host = host
	this.id = tree[0]
	this.data = tree[1]
	if (tree[2]){
		this.child = tree[2].map(node => new SNode(this, node) )
	}
	this.callback.on(SNode.CHANGE, onChange, this)
}

SNode.ADD = 'add'
SNode.MOVE = 'mov'
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
	getChild(index){
		if (!this.child) return
		return this.child[index]
	},
	insert(index, tree){
		if (!this.child) return
		const snode = new SNode(this, tree)
		if (-1 < index) this.child.splice(index, 0, snode)
		else this.child.push(snode)
		this.callback.trigger(SNode.ADD, snode)
		this.host.callback.trigger(SNode.CHANGE, SNode.ADD, this)
	},
	move(index, snode){
		if (!this.child) return
		if (-1 < index) this.child.splice(index, 0, snode)
		else this.child.push(snode)
		this.callback.trigger(SNode.MOVE, snode)
		this.host.callback.trigger(SNode.CHANGE, SNode.MOVE, this)
	},
	remove(){
		const host = this.host
		const index = host.findIndex(this.id)
		host.child.splice(index, 1)
		this.callback.trigger(SNode.DELETE)
		host.callback.trigger(SNode.CHANGE, SNode.DELETE, this)
	},
	splice(id){
		const index = this.findIndex(id)
		if (-1 === index) return
		return this.child.splice(index, 1)
	},
	update(data){
		Object.assign(this.data, data)
		this.callback.trigger(SNode.UPDATE)
		this.host.callback.trigger(SNode.CHANGE, SNode.UPDATE, this)
	},
}

return SNode
