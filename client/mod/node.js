const router = require('po/router')
const pStr = require('pico/str')
const pObj = require('pico/obj')
const SNode = require('ext/snode')

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
	if (Array.isArray(child)) {
		cl = ctx._el.getElementsByTagName('label')[0].classList
		if (sel) router.go('/g/'+snode.id)
	} else {
		cl = ctx._el.getElementsByTagName('span')[0].classList
		if (sel) router.go('/p/'+snode.id)
	}

	if (sel) cl.add('sel')
	else cl.remove('sel')
}
function onAdd(type, snode) {
	const deps = this.deps
	const node = deps.node

	switch(type){
	case SNode.ADD:
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
			// restore branch line, and to clear dnd hover
			this.el.classList.remove('hover')
			return 1
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
		dropdest(from, sender, id, cb){
			const snode = pObj.dot(this, ['deps', 'snode'])
			if (!snode.child) return
			if (id === snode.id) {
				cb(this, snode.child.length)	
			}else{
				const index = snode.child.findIndex(c => id === c.id)
				if (-1 === index) return 1
				const childSNode = snode.child[index]
				if (childSNode.child) return 1 // skip if not a leaf
				cb(this, index)	
			}
		},
		drop(from, sender, id, host, index){
			const snode = pObj.dot(this, ['deps', 'snode'])
			if (id !== snode.id) return 1

			// view rewire
			let i = this.host.modules.findIndex(m => m === this)
			this.host.modules.splice(i, 1)
			this.host = host
			host.modules.splice(index, 0, this)

			// snode rewire
			snode.host.splice(id)
			snode.host = host.deps.snode
			host.deps.snode.move(index, snode)

			// element rewire
			const child = host.el.children[index]
			host.el.insertBefore(this.el, child)
		},
	}
}
