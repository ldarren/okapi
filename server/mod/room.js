const Party = require('./Party')
const CRDT = require('./CRDT')

const Classes = {Party, CRDT}

module.exports = {
	setup(host, cfg, rsc, paths){
		return Classes[cfg.type]
	},
	verify(id, userIdx){
		const r = Party.Get(id)
		if (!r) return this.next(`Party id[${id}] not found1`)
		if (!r.team.find(u => u.i === userIdx)) return this.next('user not found')
		return this.next()
	},
	join(Class, room, member, data, output){
		let r = Party.Get(room.id)
		if (r) {
			r.add(member)
		}else{
			r = new Class(room.id, room.name, member, data)
			Party.Add(r)
		}
		Object.assign(output, room, {online: r.getTeam()})
		return this.next()
	},
	remove(id, memberIdx, output){
		const r = Party.Get(id)
		if (!r) return this.next(`Party id[${id}] not found2`)
		if (r.remove(memberIdx)) return this.next(`Checkout party[${id}] failed`)
		Object.assign(output, {id, online: r.getTeam()})
		return this.next()
	},
	get(id, output){
		const r = Party.Get(id)
		if (!r) return this.next(`Party id[${id}] not found3`)
		Object.assign(output, {id, online: r.getTeam()})
		return this.next()
	},
	update(id, data){
		const r = Party.Get(id)
		if (!r) return this.next(`Party id[${id}] not found4`)
		r.update(data)
		return this.next()
	},
	payload(id, output, record){
		const r = Party.Get(id)
		const payload = r.stringify(record)
		Object.assign(output, {payload})
		return this.next()
	},
	sendAll(q, id, type, sender, output){
		const r = Party.Get(id)
		if (!r) return this.next(`Party id[${id}] not found5`)
		if (r.sendAll(q, type, sender)) return this.next(`sendAll room[${id}] failed`)
		Object.assign(output, {id, online: r.getTeam()})
		return this.next()
	},
	send(q, id, type, msg, sender, recipient, output){
		const r = Party.Get(id)
		if (!r) return this.next(`Party id[${id}] not found6`)
		if (r.send(q, type, msg, sender, recipient)) return this.next(`send room[${id}] failed`)
		Object.assign(output, {id, online: r.getTeam()})
		return this.next()
	},
}
