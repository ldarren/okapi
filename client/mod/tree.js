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
	signals: ['tree_sel', 'dragenter', 'dragleave'],
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
			this.signal.tree_sel(id).send([this.host])
		},
		'dragstart li':function(e, target){
			const id = getChildId(target)
			e.dataTransfer.setData('text/plain', id)
			console.log('dragstart', id)
		},
		'dragend li':function(e, target){
			const id = getChildId(target)
			console.log('dragend', id)
		},
		'dragenter li':function(e, target){
			const id = getChildId(target)
			console.log('dragenter', id)
			this.signal.dragenter(id).send([this.host])
		},
		'dragleave li':function(e, target){
			const id = getChildId(target)
			console.log('dragleave', id)
			this.signal.dragleave(id).send([this.host])
		},
		'dragover li':function(e, target){
			e.preventDefault() // for drop to work
		},
		'drop li':function(e, target){
			const to = getChildId(target)
			const from = e.dataTransfer.getData('text')
			console.log('drop', from, to)
		}
	},
}
