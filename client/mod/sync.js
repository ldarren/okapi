const SNode=require('ext/SNode')

return {
	init(spec){
		const net = spec.net
		const key = 'root:' + net.currUserI
		this.root = new SNode(key, this, net, spec.data)
	},
}
