const Sapling=require('ext/Sapling')
const SNode=require('ext/SNode')

function decode(base64s){
	return base64s.map(base64 => Uint8Array.from(atob(base64), c => c.charCodeAt(0)))
}

function treeUpdate(type, data){
	switch(type){
	case 'start':
		break
	case 'msg':
		data.forEach(item => {
			const d = item.d
			const [id, ref] = d.room.split('@')
			if (!ref) throw new Error(`ref not found ${d.room}`)
			const payload = {id, type: d.type, sender: d.sender, recipient: d.recipient, changes: decode(d.msg)}
			this.callback.trigger(SNode.REFPUSH, ref, payload)
		})
		break
	}
}

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
		// load root when user is loaded
		net.callback.on('add', onAdd, this)

		this.sse = spec.sse
		this.sse.callback.on('start', treeUpdate, this)
		this.sse.callback.on('msg', treeUpdate, this)
	},
	fini(){
		this.sse.callback.off('msg', treeUpdate, this)
		this.sse.callback.off('start', treeUpdate, this)
		this.net.callback.off('add', onAdd)
	}
}
