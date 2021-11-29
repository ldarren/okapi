return {
	signals: ['menu_add', 'menu_del'],
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
			switch(target.id){
			case 'add':
				this.signal.menu_add().send(this.host)
				break
			case 'del':
				this.signal.menu_del().send(this.host)
				break
			}
		}
	}
}
