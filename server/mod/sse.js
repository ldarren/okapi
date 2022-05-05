const HEADERS = {
	'Content-Type': 'text/event-stream',
	'Connection': 'keep-alive',
	'Cache-Control': 'no-cache'
}

const clients = {}

function pack(evt, data){
	return `event: ${evt}\ndata: ${JSON.stringify(data)}\n\n`
}

function connect(req, res, id){
	res.writeHead(200, HEADERS)

	res.write(pack('start', id))

	clients[id] = res

	req.on('close', () => {
		delete clients[id]
	})
}

module.exports = {

	setup(host, cfg, rsc, paths){
	},

	connect(req, res, user){
		connect(req, res, user.i)
		return this.next()
	},

	find(user){
		const c = clients[user.i]
		if (!c) return this.next('not found')
		return this.next()
	},

	send(user, data){
		const c = clients[user.i]
		if (!c) return this.next()
		c.write(pack('msg', data))
		return this.next()
	},

	sendAll(data){
		Object.keys(clients).forEach(id => clients[id].write(pack('msg', data)))
		return this.next()
	},
}
