const Automerge = require('automerge')
const Party = require('./Party')

const crdts = {}

/**
 * CRDT class inherit Room
 *
 * @param {string} id - unique identifier
 * @param {string} name - room name
 * @param {object} owner - creator user object
 * @param {number} owner.i - owner index
 * @param {string} ref - CRDT group Ref
 *
 * @returns {void} - this
 */
function CRDT(id, name, owner, record){
	Party.call(this, id, name, owner, record)
}

CRDT.prototype = {
	setup(data = {}){
		this.payload = Automerge.from(data)
console.log('@@@@@@@@@@@@@ setup', data, this.payload)
	},

	update(data){
		if (!this.validate(data)) return
		this.payload = Automerge.merge(data, this.payload)
console.log('@@@@@@@@@@@@@ update', data, this.payload)
	},

	stringify(data){
		let changes
		if (data){
			const merge = Automerge.from(data)
			changes = Automerge.getAllChanges(merge)
		}else{
			changes = Automerge.getAllChanges(this.payload)
		}
console.log('@@@@@@@@@@@@@ stringify', data, this.payload, changes, '[', Buffer.from(changes[0]).toString('base64'), ']')
		return Buffer.from(changes[0]).toString('base64')
	},
}

Object.setPrototypeOf(CRDT.prototype, Party.prototype)

module.exports = CRDT
