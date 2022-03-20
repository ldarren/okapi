const Sapling=require('ext/Sapling')
const SNode=require('ext/SNode')

function load(ctx, net){
	const userI = net.currUserI
	if (!userI) return

	const key = 'root:' + net.currUserI
	ctx.root = new SNode(null, key, ctx, net, ctx.data)
	ctx.callback.trigger(Sapling.ADD, ctx.root)
}

function onAdd(type, net, i){
	load(this, net)
}

return {
	init(spec){
		this.data= spec.data
		const net = spec.net
		this.net = net
		load(this, net)
		net.callback.on('add', onAdd, this)
	},
	fini(){
		this.net.callback.off('add', onAdd)
	}
}
