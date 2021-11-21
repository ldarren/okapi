return {
	deps:{
		node:'view',
		tree: 'Sapling',
	},
	create(deps, params){
		
	},
	events:{
		'click .tree_label':function(e, target){
			this.el.querySelectorAll('.sel').forEach(ele => ele.classList.remove('sel'))
			target.classList.add('sel')
			console.log('click', target.textContent)
		}
	}
}
