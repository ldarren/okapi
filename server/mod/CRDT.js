const Automerge = require('automerge')
const Room = require('./room')

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
	Room.call(this, id, name. owner, record)
}

CRDT.prototype = {
	setup(data = {}){
		this.payload = Automerge.from(data)
	},

	update(data){
		if (!this.validate(data)) return
		this.payload = Automerge.merge(this.payload, data)
	},

	stringify(){
		const changes = Automerge.getAllChanges(this.payload)
		return String.fromCharCode.apply(null, changes)
	},
}

Object.setPrototypeOf(CRDT.prototype, Room.prototype)

module.exports = {
	setup(host, cfg, rsc, paths){
	},
	join(crdt, member, record, output){
		let c = crdts[crdt.id]
		if (c) {
			c.add(member)
		}else{
			c = new CRDT(crdt.id, member, record)
			add(c)
		}
		Object.assign(output, crdt, {online: c.getTeam()})
		return this.next()
	},
	getAllChanges(crdt, record, output){
		let c = crdts[crdt.id]
		const merge = Automerge.from(record)
		const changes = Automerge.getAllChanges(merge)
		Object.assign(output, {bin})
		return this.next()
	},
}
