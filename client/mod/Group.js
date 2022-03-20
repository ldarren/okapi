const pStr = require('pico/str')
const pObj = require('pico/obj')

return {
	deps: {
		tpl: 'file',
		snode: 'snode',
	},
	create(deps, params){
		this.el.innerHTML=deps.tpl(deps.snode.data())
	},
	events:{
		'click input':function(e, target){
			const snode = this.deps.snode
			let ref = pObj.dot(snode, ['data', 'ref'])
			if (ref && !confirm(`Do you really want to update ${ref} ?`)) return

			switch(target.id){
			case 'gen':
				ref = Date.now().toString(36) + pStr.rand()
				break
			case 'ref':
				ref = prompt('Shareable key', '')
				break
			case 'rem':
				ref = ''
				break
			}

			snode.update({ref})
			this.el.innerHTML=this.deps.tpl(snode.data())
		}
	}
}
