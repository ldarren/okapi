return {
	deps:{
		tpl:'file',
		data:'map',
		list:'list'
	},
	create(deps,params){
		this.el.innerHTML=deps.tpl(deps.list)
	},
	events:{
		'click button':function(e, target){
			console.log('click', target.textContent)
		}
	}
}
