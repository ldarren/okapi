const Callback=require('po/Callback')
const SNode=require('ext/SNode')
const storage=window.localStorage

const getKey = name => ('sapling:' + name)

function get(ctx){
	if (!ctx.name) return
	const key = getKey(ctx.name)
	let obj
	try{
		const json=storage.getItem(key)
		if (!json) return
		obj = JSON.parse(json)
	}catch(ex){
		storage.removeItem(key)
	}
	return obj
}

function set(ctx){
	if (!ctx.name || !ctx.root) return
	const key = getKey(ctx.name)
	storage.setItem(key, JSON.stringify(ctx.root.join()))
}

function onChange(type, ...args){
	switch(type){
	case SNode.CHANGE:
		set(this)
		break
	}
}

function Sapling(seed, name, opt){
	opt = opt || {}
	this.name = name
	this.callback = new Callback
	this.callback.on(SNode.CHANGE, onChange, this)

	this.init.apply(this, Array.prototype.slice.call(arguments, 3))

	const cache = get(this)
	this.root = new SNode(this, cache || seed)
	set(this)
}

Sapling.prototype={
	// to be overriden
	init(spec){},
	fini(){},

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
