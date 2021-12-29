const Automerge = require('automerge')

const crdts = {}

function CRDT_Node(obj){
	this.merge = Automerge.change(Automerge.init(), doc => {
		doc.name = '/post'
		doc.variables = []
	})
	this.uat = Date.now()
}

function CRDT_Leaf(obj){
	this.merge = Automerge.change(Automerge.init(), doc => {
		doc.name = '/post'
		doc.method = 'POST'
		doc.url = 'https://httpbin.org/post'
		doc.headers = ['{"Content-Type":"application/json"}']
		doc.req= new Automerge.Text()
		doc.req.insertAt(0, '{"foo":"bar"}')
	})
}

CRDT_Leaf.prototype = {
	get(){
		this.uat = Date.now()
		return this.merge
	},
	update(changes, cb){
console.log('server receive ######', changes)
		if (!changes) return
		// receive same changes from upstream
		try{
			const [merge2, patch] = Automerge.applyChanges(merge, changes)
console.log('server merge2', patch.diffs.props, merge2.req.toString())
			if (Object.keys(patch.diffs.props).length){
				const update = Automerge.getChanges(merge, merge2)
				WorkerModule.master.update(update)
			}
			merge = merge2
		}catch(ex){
			console.error(ex)
		}
	},          
	exit(cb){   
		close()     
		cb && cb()        
	}            
}

function CRDT(obj){
	const i = obj.i
	// TODO: replace by redis check
	let crdt = crdts[i]
	if (!crdt){
		crdt = obj.child ? new CRDT_Leaf(obj) : new CRDT_Node(obj)
		crdts.push(crdt)
	}
	return crdt
}

module.exports = {
	setup(host, cfg, rsc, paths){
	},
	get(def, output){
		const crdt = CRDT(obj)
		Object.assign(output, crdt.get())
		this.next()
	},
	update(obj, changes, output){
		const crdt = CRDT(obj)
		Object.assign(output, crdt.update(changes))
		this.next()
	},
	check(offset, outputs){
		const expiry = Date.now() - offset
		const keys = Object.keys(crdts)
		for (let i = keys.length, crdt; i > -1; i--){
			crdt = crdts[keys[i]]
			if (expiry > crdt.uat){
				outputs.push(crdt.get())
				crdts.splice(i, 1)
			}
		}
		this.next()
	}
}
