const Callback=require('po/Callback')
const SNode=require('ext/SNode')

function onChange(type, subtype, snode, changes){
	if ('CRDT' !== subtype) return
	snode.crdt.save(changes)
}

function treeUpdate(...args){
	console.log(...args)
}

function Sapling(name, net){
	this.name = name
	this.callback = new Callback

	this.init.apply(this, Array.prototype.slice.call(arguments, 2))
	this.callback.on(SNode.CHANGE, onChange, this)

	this.ready()
}

Sapling.ADD = 'add'
Sapling.DELETE = 'del'

Sapling.prototype={
	// to be overriden
	init(spec){
		this.root = new SNode('root:0', this, spec.net)
		this.sse = sepc.sse
		this.sse.callback.on('update', treeUpdate, this)
		this.callback.trigger(Sapling.ADD, this.root)
	},
	fini(){
		this.sse.callback.off('update', treeUpdate, this)
	},
	ready(){},

	get(id){
		return this.root.findById(id)
	},
	insert(path, node, index, tree = this.root){
		const host = tree.find(path)
		if (!host) return 0
		host.insert(index, node)
		return 1
	},
	move(from, to, index, tree = this.root){
		const node = this.remove(from, null, tree)
		this.insert(to, node, index, tree)
	},
	remove(path, index, tree = this.root){
		let node
		if (null == index){
			node = tree.find(path)
		}else{
			const host = tree.find(path)
			node = host.getChild(index)
		}
		if (!node) return
		node.remove()
		return node
	},
	update(path, data, tree = this.root){
		const node = tree.find(path)
		if (!node) return
		node.update(data)
	},
}

return Sapling
