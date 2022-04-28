const Automerge = require('automerge')
const Party = require('./Party')

/**
 * CRDT class inherit Room
 *
 * @param {string} id - unique identifier
 * @param {string} name - room name
 * @param {object} owner - creator user object
 * @param {number} owner.i - owner index
 * @param {string} record - initial record
 *
 * @returns {void} - this
 */
function CRDT(id, name, owner, record){
	Party.call(this, id, name, owner, record)
}

CRDT.prototype = {
	setup(data = {}){
		this.payload = Automerge.from(data)
	},

	update(data){
		if (!this.validate(data)) return
		this.payload = Automerge.merge(this.payload, data)
	},

	stringify(data){
		let changes
		if (data){
			const merge = Automerge.from(data)
			changes = Automerge.getAllChanges(merge)
		}else{
			changes = Automerge.getAllChanges(this.payload)
		}
		return btoa(String.fromCharCode.apply(null, changes))
	},
}

Object.setPrototypeOf(CRDT.prototype, Party.prototype)

module.exports = CRDT
