function populate(self, node, child){
	if (!child) return
	for(let i=0,c; (c=child[i]); i++){
		// get [node, view] from parent
		self.spawn(node, null, [['snode', 'SNode',c]])
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

return {
	deps:{
		tplNode:'file',
		tplLeaf:'file',
		snode:'SNode',
		node:'view',
	},
	create(deps, params){
		render(this, deps.snode, deps.node, deps.tplNode, deps.tplLeaf)
		deps.snode.callback.on('add', (type, snode) => {
			this.spawn(deps.node, null, [['snode', 'SNode', snode]])
		})
	},
	remove(){
		this.deps.snode.callback.off()
		this.super.remove()
	},
	slots: {
		tree_sel(from, sender, id){
			const deps = this.deps
			const snode = deps.snode
			const data = snode.data
			if (id === snode.id) {
				data.sel = 1
				sel(this, snode)
				return 1
			}
			if (data.sel) {
				data.sel = 0
				sel(this, snode)
			}
			return 1
		},
		menu_add(from, sender, type){
			const snode = this.deps.snode
			const data = snode.data
			if (!data.sel) return true
			console.log('^^^^^^add', type)
			if (snode.child){
				snode.insert(null, ['untitled', {name: 'new'}])
			}
			const host = snode.host
			host.insert(null, ['untitled', {name: 'new'}])
		},
		menu_del(from, sender, force){
			const snode = this.deps.snode
			const data = snode.data
			if (!data.sel) return true
			console.log('^^^^^^del', this.el.id, force)
			snode.remove()
			this.remove()
		}
	}
}
