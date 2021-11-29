function getNodeId(ele){
	const id = ele.id
	if (id) return id
	const sib = ele.previousElementSibling
	if (!sib) return
	return sib.id
}

return {
	signals: ['tree_sel'],
	deps:{
		tree:'Sapling',
		node:'view',
	},
	create(deps, params){
		// get [node, view] from parent
		this.spawn(deps.node, null, [['snode','SNode',deps.tree.root]])
	},
	events:{
		'click .tree_label':function(e, target){
			const id = getNodeId(target)
			if (!id) return
			this.signal.tree_sel(id).send([this.host])
		}
	},
	slots: {
	},
}
