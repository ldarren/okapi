function populate(self, node, child){
	if (!child) return
	for(let i=0,c; (c=child[i]); i++){
		// get [node, view] from parent
		self.spawn(node, null, [['snode', 'SNode',c]])
	}
}

return {
	deps:{
		tplNode:'file',
		tplLeaf:'file',
		snode:'SNode',
		node:'view',
	},
	create(deps, params){
		const child = deps.snode.child
		if (child){
			this.el.innerHTML=deps.tplNode(deps.snode)
			populate(this, deps.node, child)	
			this.setElement(this.el.getElementsByTagName('ul')[0])
		}else{
			this.el.innerHTML=deps.tplLeaf(deps.snode)
		}
	},
}
