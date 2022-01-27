const pStr = require('pico-common').export('pico/str')
const rooms = {}

function add(room){
	rooms[room.id] = room
}

function remove(id){
	delete rooms[id]
}

/**
 * Room class
 *
 * @param {string} id - unique identifier
 * @param {string} name - room name
 * @param {object} owner - creator user object
 * @param {number} owner.i - owner index
 *
 * @returns {void} - this
 */
function Room(id, name, owner){
	this.id = id
	this.name = name
	this.owner = owner
	this.team = [owner]
}

Room.prototype = {
	add(member){
		const mi = member.i
		if (this.team.find(m => mi === m.i)) return 1
		this.team.push(member)
		return 0
	},
	remove(i){
		const idx = this.team.findIndex(u => i === u.i)
		this.rooms.splice(idx, 1)
		if (!this.rooms.length) {
			remove(this.room.id)
			return 0
		}
		if (i === this.owner.i){
			this.owner = this.rooms[0]
		}
		return 0
	},
	team(all){
		if (all) return this.team.slice()
		return this.team.map(m => m.i)
	},
	sendAll(q, msg, sender){
		const senderi = sender.i
		if (!this.team.find(s => senderi === s.i)) return 1
		const room = this.id
		this.team.forEach(r => q.push({sender: senderi, recipient: r.i, room, msg}))
		return 0
	},
	send(q, msg, sender, recipient){
		const senderi = sender.i
		const recipienti = recipient.i
		if (!senderi || !recipienti || senderi === recipienti) return 1
		let found = 0
		const team = this.team
		for (let i = 0, m; (m = team[i]); i++){
			if (senderi === m.i) found += 1
			if (recipienti === m.i) found += 2
		}
		if (3 !== found) return 2
		q.push({sender: senderi, recipient: recipienti, room: this.id, msg})
		return 0
	}
}

module.exports = {
	setup(host, cfg, rsc, paths){
	},
	create(room, owner, output){
		const id = Date.now().toString(36) + pStr.rand()
		const r = new Room(id, room.name, owner)
		add(r)
		Object.assign(output, room, {id, online: r.team()})
		this.next()
	},
	update(room, member, output){
		const r = rooms[room.id]
		if (!r) return this.next(`Room id[${room.id}] not found`)
		switch(room.action){
		case 'add':
			if (r.add(member)) return this.next(`Checkin room[${room.id}] failed`)
			break
		case 'remove':
			if (room.remove(member)) return this.next(`Checkout room[${room.id}] failed`)
			break
		}
		Object.assign(output, room, {online: r.team()})
		return this.next()
	},
	sendAll(q, room, sender, output){
		const r = rooms[room.id]
		if (!r) return this.next(`Room id[${room.id}] not found`)
		if (r.sendAll(q, room.msg, sender)) return this.next(`sendAll room[${room.id}] failed`)
		Object.assign(output, room, {online: r.team()})
		return this.next()
	},
	send(q, room, msg, sender, recipient, output){
		const r = rooms[room.id]
		if (!r) return this.next(`Room id[${room.id}] not found`)
		if (r.send(q, msg, sender, recipient)) return this.next(`send room[${room.id}] failed`)
		Object.assign(output, room, {online: r.team()})
		return this.next()
	}
}
