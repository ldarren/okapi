const pStr = require('pico/str')

return {
	deps: {
		tpl: 'file',
		snode: 'snode',
	},
	create(deps, params){
		this.el.innerHTML=deps.tpl(deps.snode.data)
	},
	events:{
		'click input':function(e, target){
			const snode = this.deps.snode
			let key = snode.data.key

			switch(target.id){
			case 'gen':
				key = Date.now().toString(36) + pStr.rand()
				break
			case 'ref':
				key = prompt('Shareable key', '')
				break
			case 'rem':
				key = ''
				break
			}

			snode.update({key})
			this.el.innerHTML=this.deps.tpl(snode.data)
		}
	}
}
