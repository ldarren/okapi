const router = require('po/router')
const pStr = require('pico/str')
const pObj = require('pico/obj')
const SNode = require('ext/snode')

const SELECTED = 'sel'

function spawn(ctx, View, snode, params){
	ctx.spawn(View, params, [
		['options', 'map', {tag:'li', draggable:true}],
		['snode', 'SNode', snode]
	])
}

function populate(self, node, child){
	if (!child) return
	for(let i=0,c; (c=child[i]); i++){
		// get [node, view] from parent
		spawn(self, node, c)
	}
}
function render(ctx, snode, node, tplNode, tplLeaf){
	const child = snode.child
	const id = snode.id
	const sel = id === router.getParam('id')
	if (child){
		ctx.el.innerHTML=tplNode({id, data: snode.data(), sel})
		populate(ctx, node, child)
		ctx.setElement(ctx.el.getElementsByTagName('ul')[0])
	}else{
		ctx.el.innerHTML=tplLeaf({id, data: snode.data(), sel})
	}
	if (sel){
		ctx.signal.check([id]).send(ctx.host)
	}
}
function classList(ctx, isInner){
	if (isInner) {
		return ctx._el.getElementsByTagName('label')[0].classList
	}
	return ctx.el.getElementsByTagName('span')[0].classList
}
function onChange(type, snode, _idx) {
	const deps = this.deps

	switch(type){
	case SNode.ADD:
		// TODO: insert new node to index position
		spawn(this, deps.Node, snode, {_idx})
		break
	case SNode.DELETE:
		{
			const id = snode.id
			const node = this.modules.find(mod => id === mod.getSNodeId())
			node.remove()
		}
		break
	}
}
function check(ctx, checked){
	ctx._el.querySelector('input').checked = checked
}

return {
	signals: ['check', 'uncheck'],
	deps:{
		tplNode:'file',
		tplLeaf:'file',
		env: 'map',
		// below are injected by tree
		snode:'SNode',
		Node:'view',
		isRoot:'bool'
	},
	create(deps, params){
		const snode = deps.snode
		render(this, snode, deps.Node, deps.tplNode, deps.tplLeaf)
		this.classList = classList(this, snode.isInner)
		if (snode.isInner){
			snode.callback.on(SNode.ADD, onChange, this)
			snode.callback.on(SNode.DELETE, onChange, this)
		}
	},
	remove(){
		this.deps.snode.callback.off()
		this.super.remove.call(this)
	},
	slots: {
		tree_sel(from, sender, id){
			const snode = pObj.dot(this, ['deps', 'snode'])
			if (id === snode.id) {
				const cl = this.classList
				cl.add(SELECTED)
				if (snode.isInner) router.go('#/g/'+snode.id)
				else router.go('#/p/'+snode.id)
				this.signal.check([id]).send(this.host)
				return
			}
			return 1
		},
		tree_unsel(from, sender, trace){
			const snode = pObj.dot(this, ['deps', 'snode'])
			const cl = this.classList
			if (trace[0] !== snode.id && cl.contains(SELECTED)) {
				cl.remove(SELECTED)
				this.signal.uncheck(trace).send(this.host)
				return
			}
			return 1
		},
		check(from, sender, trace){
			trace.push(pObj.dot(this, ['deps', 'snode', 'id']))
			check(this, 1)
			this.signal.check(trace).send(this.host)
		},
		uncheck(from, sender, trace){
			const id = pObj.dot(this, ['deps', 'snode', 'id'])
			if (trace.includes(id)) return
			check(this, 0)
			this.signal.uncheck(trace).send(this.host)
		},
		menu_add(from, sender, type){
			if (!this.classList.contains(SELECTED)) return true

			const uuid = Date.now().toString(36) + ':' + pStr.rand()
			const name = prompt('Name', '/users')
			const tree = [uuid, {name}]
			const snode = this.deps.snode

			if (snode.child){
				snode.insert(null, tree)
				return
			}
			const host = snode.host
			host.insert(null, tree)
		},
		menu_del(from, sender, force){
			if (!this.classList.contains(SELECTED)) return true
			const snode = this.deps.snode
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
			/* handled by events
			let i = this.host.modules.findIndex(m => m === this)
			this.host.modules.splice(i, 1)
			this.host = host
			host.modules.splice(index, 0, this)
			*/

			// snode rewire
			snode.host.splice(id)
			snode.host = host.deps.snode
			host.deps.snode.move(index, snode)

			// element rewire
			/* handled by events
			const child = host.el.children[index]
			host.el.insertBefore(this.el, child)
			*/
		},
	},
	getSNodeId(){
		return this.deps.snode.id
	}
}
