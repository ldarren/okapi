const Collection = inherit('po/Collection')

return {
	/*
	 * override Collection.get to "getSet"
	 */
	get(id){
		const model = Collection.prototype.get.call(this, id)
		if (model) return model
		return Collection.prototype.set.call(this, {id})
	},
}
