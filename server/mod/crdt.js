const Automerge = require('automerge')

module.exports = {
	setup(host, cfg, rsc, paths){
		let merge = Automerge.change(Automerge.init(), doc => {
			doc.method = 'POST'
			doc.url = 'https://httpbin.org/post'
			doc.headers = ['{"Content-Type":"application/json"}']
			doc.req= new Automerge.Text()
			doc.req.insertAt(0, '{"foo":"bar"}')
		})
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
