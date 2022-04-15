const Class = {
	Party: require('./Party'),
	CRDT: require('./CRDT')
}

module.exports = {
	setup(host, cfg, rsc, paths){
		return Class[cfg.Class]
	},
	verify(id, userIdx){
		const r = Room.Get(id)
		if (!r) return this.next(`Room id[${id}] not found`)
		if (!r.team.find(u => u.i === userIdx)) return this.next('user not found')
		return this.next()
	},
	join(Class, room, member, data, output){
		let r = Room.Get(room.id)
		if (r) {
			r.add(member)
			r.update(data)
		}else{
			r = new Class(room.id, room.name, member, data)
			Room.Add(r)
		}
		Object.assign(output, room, {online: r.getTeam()})
		return this.next()
	},
	remove(id, memberIdx, output){
		const r = Room.Get(id)
		if (!r) return this.next(`Room id[${id}] not found`)
		if (r.remove(memberIdx)) return this.next(`Checkout room[${id}] failed`)
		Object.assign(output, {id, online: r.getTeam()})
		return this.next()
	},
	get(id, output){
		const r = Room.Get(id)
		if (!r) return this.next(`Room id[${id}] not found`)
		Object.assign(output, {id, online: r.getTeam()})
		return this.next()
	},
	update(id, data){
		const r = Room.Get(room.id)
		if (!r) return this.next(`Room id[${room.id}] not found`)
		r.update(data)
		return this.next()
	},
	payload(id, record, output){
		const r = Room.Get[id]
		const payload = r.stringify(record)
		Object.assign(output, {payload})
		return this.next()
	},
	sendAll(q, room, sender, output){
		const r = Room.Get(room.id)
		if (!r) return this.next(`Room id[${room.id}] not found`)
		if (r.sendAll(q, sender)) return this.next(`sendAll room[${room.id}] failed`)
		Object.assign(output, room, {online: r.getTeam()})
		return this.next()
	},
	send(q, room, msg, sender, recipient, output){
		const r = Room.Get(room.id)
		if (!r) return this.next(`Room id[${room.id}] not found`)
		if (r.send(q, msg, sender, recipient)) return this.next(`send room[${room.id}] failed`)
		Object.assign(output, room, {online: r.getTeam()})
		return this.next()
	},
}
