const pStr = require('pico/str')
const pObj = require('pico/obj')

return {
	deps: {
		tpl: 'file',
		snode: 'snode',
	},
	create(deps, params){
		const snode = deps.snode
		this.el.innerHTML=deps.tpl(snode.ref ? {ref: snode.ref} : snode.data())
	},
	events:{
		'click input':function(e, target){
			const snode = this.deps.snode
			let {org} = snode.data() // origin of ref
			if (org && !confirm(`Do you really want to update ${org} ?`)) return

			switch(target.id){
			case 'gen':
				org = Date.now().toString(36) + pStr.rand()
				break
			case 'org':
				org = prompt('Shareable key', '')
				break
			case 'rem':
				org = ''
				break
			}

			snode.update({org})
			this.el.innerHTML=this.deps.tpl(snode.data())
		}
	}
}
