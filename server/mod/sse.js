const HEADERS = {
	'Content-Type': 'text/event-stream',
	'Connection': 'keep-alive',
	'Cache-Control': 'no-cache'
}

const clients = {}

function pack(data){
	return `data: ${JSON.stringify(data)}\n\n`
}

function connect(req, res, id){
	res.writeHead(200, HEADERS)

	res.write(pack('start'))

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
		this.next()
	},

	sendAll(data){
		Object.keys(clients).forEach(id => clients[id].write(pack(data)))
		this.next()
	},
}
