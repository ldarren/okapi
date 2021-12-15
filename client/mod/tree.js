function getNodeId(ele){
	const id = ele.id
	if (id) return id
	const sib = ele.previousElementSibling
	if (!sib) return
	return sib.id
}

function getChildId(ele){
	const label = ele.querySelector('.tree_label')
	if (!label) return
	return label.id || label.getAttribute('for')
}

return {
	signals: ['tree_unsel', 'tree_sel', 'dragstart', 'dragend', 'dragenter', 'dragleave', 'dropdest', 'drop'],
	deps:{
		tree:'Sapling',
		node:'view',
	},
	create(deps, params){
		// get [node, view] from parent
		this.spawn(deps.node, null, [
			["options", "map", {"tag":"li", "draggable":false}],
			['snode','SNode',deps.tree.root]
		])
	},
	events:{
		'click .tree_label':function(e, target){
			const id = getNodeId(target)
			if (!id) return
			// TODO, split to tree_unsel and tree_sel. purpose: uncheck selected tree
			this.signal.tree_sel(id).send([this.host])
		},
		'dragstart li':function(e, target){
			const id = getChildId(target)
			e.dataTransfer.setData('text/plain', id)
			this.signal.dragstart(id).send([this.host])
		},
		'dragend li':function(e, target){
			const id = getChildId(target)
			this.signal.dragend(id).send([this.host])
		},
		'dragenter li':function(e, target){
			const id = getChildId(target)
			this.signal.dragenter(id).send([this.host])
		},
		'dragleave li':function(e, target){
			const id = getChildId(target)
			this.signal.dragleave(id).send([this.host])
		},
		'dragover li':function(e, target){
			e.preventDefault() // for drop to work
		},
		'drop li':function(e, target){
			const toId = getChildId(target)
			const fromId = e.dataTransfer.getData('text')
			this.signal.dropdest(toId, (toView, index) => {
				if (!toView) return console.error(toId, 'not found')
				this.signal.drop(fromId, toView, index).send([this.host])
			}).send([this.host])
		}
	},
	slots:{
		check(from, sender, trace){
			this.signal.tree_unsel(trace).send([this.host])
		}
	}
}
