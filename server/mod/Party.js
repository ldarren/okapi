const rooms = {}

/**
 * Room class
 *
 * @param {string} id - unique identifier
 * @param {string} name - room name
 * @param {object} owner - creator user object
 * @param {number} owner.i - owner index
 * @param {*} data - the data that shared by the room member
 *
 * @returns {void} - this
 */
function Room(id, name, owner, data){
	this.id = id
	this.name = name
	this.owner = owner
	this.team = [owner]
	this.setup(data)
}

Room.Add = room => {
	rooms[room.id] = room
}

Room.Get = id => rooms[id]

Room.Remove = id => {
	delete rooms[id]
}

Room.prototype = {
	add(member){
		const mi = member.i
		if (this.team.find(m => mi === m.i)) return 1
		this.team.push(member)
		return 0
	},
	remove(i){
		const t = this.team
		const idx = t.findIndex(u => i === u.i)
		if (null == idx) return 1
		t.splice(idx, 1)
		if (!t.length) {
			Room.Remove(this.id)
			return 0
		}
		if (i === this.owner.i){
			this.owner = t[0]
		}
		return 0
	},
	getTeam(all){
		if (all) return this.team.slice()
		return this.team.map(m => m.i)
	},
	sendAll(q, sender){
		const senderi = sender.i
		if (!this.team.find(s => senderi === s.i)) return 1
		const room = this.id
		const msg = this.stringify()
		this.team.forEach(r => q.push({sender: senderi, recipient: r.i, room, msg}, {cby: senderi}))
		return 0
	},
	send(q, msg, sender, recipient){
		const senderi = sender.i
		const recipienti = recipient.i
		if (!senderi || !recipienti) return 1
		let found = 0
		const team = this.team
		for (let i = 0, m; (m = team[i]); i++){
			if (senderi === m.i) found += 1
			if (recipienti === m.i) found += 2
		}
		if (3 !== found) return 2
		q.push({sender: senderi, recipient: recipienti, room: this.id, msg}, {cby: senderi})
		return 0
	},

	setup(data){
		this.payload = []
		if (this.validate(data)) this.payload.push(data)
	},

	validate(data){
		return Boolean(data)
	},

	update(data){
		if (!this.validate(data)) return
		this.payload.push(data)
	},

	stringify(){
		const str = JSON.stringify(this.payload)
		this.payload.length = 0
		return str
	},
}

module.exports = Room
