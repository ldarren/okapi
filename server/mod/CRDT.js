const Automerge = require('automerge')
const Party = require('./Party')

function stringify(changes){
	return changes.map(change => btoa(String.fromCharCode.apply(null, change)))
}

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

	payload(id, output){
		const r = Party.Get(id)
		Object.assign(output, r.payload)
		return this.next()
	},

	update(uint8arr){
		if (!this.validate(uint8arr)) return
		if (!uint8arr.filter(uint8 => ArrayBuffer.isView(uint8))) return
		const [payload, changes] = Automerge.applyChanges(this.payload, uint8arr) 
		this.payload = payload
		return stringify(changes)
	},

	stringify(data){
		let changes
		if (data){
			const merge = Automerge.from(data)
			changes = Automerge.getAllChanges(merge)
		}else{
			changes = Automerge.getAllChanges(this.payload)
		}
		return stringify(changes)
	},
}

Object.setPrototypeOf(CRDT.prototype, Party.prototype)

module.exports = CRDT
