return {
	deps:{
		tpl:'file',
		tree: 'Sapling',
		node: 'view',
		leaf: 'view',
	},
	create(deps, params){
		this.el.innerHTML=deps.tpl(deps.tree)
	},
}
