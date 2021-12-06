const pStr = require('pico/str')
const pObj = require('pico/obj')

function populate(self, node, child){
	if (!child) return
	for(let i=0,c; (c=child[i]); i++){
		// get [node, view] from parent
		self.spawn(node, null, [
		["options", "map", {"tag":"li", "draggable":true}],
		['snode', 'SNode',c]
		])
	}
}
function render(ctx, snode, node, tplNode, tplLeaf){
	const child = snode.child
	if (child){
		ctx.el.innerHTML=tplNode(snode)
		populate(ctx, node, child)
		ctx.setElement(ctx.el.getElementsByTagName('ul')[0])
	}else{
		ctx.el.innerHTML=tplLeaf(snode)
	}
}
function sel(ctx, snode){
	const child = snode.child
	const sel = snode.data.sel
	let cl
	if (Array.isArray(child)) cl = ctx._el.getElementsByTagName('label')[0].classList
	else cl = ctx._el.getElementsByTagName('span')[0].classList

	if (sel) cl.add('sel')
	else cl.remove('sel')
}
function onAdd(type, snode) {
	const deps = this.deps
	const node = deps.node

	switch(type){
	case 'add':
		this.spawn(node, null, [['snode', 'SNode', snode]])
		break
	}
}

return {
	deps:{
		tplNode:'file',
		tplLeaf:'file',
		snode:'SNode',
		node:'view',
	},
	create(deps, params){
		render(this, deps.snode, deps.node, deps.tplNode, deps.tplLeaf)
		deps.snode.callback.on('add', onAdd, this)
	},
	remove(){
		this.deps.snode.callback.off()
		this.super.remove()
	},
	slots: {
		tree_sel(from, sender, id){
			const snode = pObj.dot(this, ['deps', 'snode'])
			const data = snode.data
			if (id === snode.id) {
				data.sel = 1
				sel(this, snode)
			} else if (data.sel) {
				data.sel = 0
				sel(this, snode)
			}
			return 1
		},
		menu_add(from, sender, type){
			const snode = this.deps.snode
			if (!pObj.dot(snode, ['data', 'sel'])) return true

			const uuid = Date.now().toString(36) + ':' + pStr.rand()
			const name = prompt('Name', '/users')
			const tree = [uuid, {name}]

			if (snode.child){
				snode.insert(null, tree)
			}
			const host = snode.host
			host.insert(null, tree)
		},
		menu_del(from, sender, force){
			const snode = this.deps.snode
			if (!pObj.dot(snode, ['data', 'sel'])) return true
			snode.remove()
			this.remove()
		},
		dragstart(from, sender, id){
			// remove branch line
		},
		dragend(from, sender, id){
			// restore branch line
		},
		dragenter(from, sender, id){
			const snode = pObj.dot(this, ['deps', 'snode'])
			if (id !== snode.id) return 1
		
			if (snode.child){
				this._el.querySelector('input').checked = 1
			}
			this.el.classList.add('hover')
		},
		dragleave(from, sender, id){
			const snode = pObj.dot(this, ['deps', 'snode'])
			if (id !== snode.id) return 1
			this.el.classList.remove('hover')
		},
		drop(from, sender,fromId, toId){
			const snode = pObj.dot(this, ['deps', 'snode'])
			if (fromId === snode.id) {
				
			}
			return 1
		}
	}
}
