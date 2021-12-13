return {
	deps: {
		tpl: 'file',
		tree: 'Sapling',
		settings: 'models',
		requests: 'models',
	},
	create(deps, params){
		this.el.innerHTML=deps.tpl()
	}
}
