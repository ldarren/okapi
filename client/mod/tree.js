return {
	deps:{
		tpl:'file',
		data:'map'
	},
	create(deps,params){
		this.el.innerHTML=deps.tpl(deps.data)
	},
	events:{
		'click .tree_label':function(e, target){
			this.el.querySelectorAll('.sel').forEach(ele => ele.classList.remove('sel'))
			target.classList.add('sel')
			console.log('click', target.textContent)
		}
	}
}
