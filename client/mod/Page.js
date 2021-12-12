return {
	deps: {
		tpl: 'file',
	},
	create(deps, params){
		this.el.innerHTML=deps.tpl()
	}
}
