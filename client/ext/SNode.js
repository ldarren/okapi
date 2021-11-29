var Callback=require('po/Callback')

function SNode(host, tree){
	this.callback = new Callback
	this.host = host
	this.id = tree[0]
	this.data = tree[1]
	if (tree[2]){
		this.child = tree[2].map(node => new SNode(this, node) )
	}
}

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
		if (null == index) this.child.push(snode)
		else this.child.splice(index, 0, snode)
		this.callback.trigger('add', snode)
	},
	remove(){
		const index = this.host.findIndex(this.id)
		this.host.child.splice(index, 1)
		this.callback.trigger('del')
	},
	update(data){
		Object.assign(this.data, data)
		this.callback.trigger('update')
	},
}

return SNode
