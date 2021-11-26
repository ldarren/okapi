return {
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
			this.el.querySelectorAll('.sel').forEach(ele => ele.classList.remove('sel'))
			target.classList.add('sel')
			console.log('click', target.textContent)
		}
	}
}
