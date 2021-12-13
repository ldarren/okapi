const router = require('po/router')
const specMgr = require('p/specMgr')
    
function pageChanged(evt, state, params){
    this.clear()
    const spec = []
    for (let i=0, k; (k=state[i]); i++){
        spec.push(this.specMap[k])
    }
    this.spawnBySpec(spec, params)
}
function extract(base){
	// todo use pathname in prod
	// return location.pathname.substring(base.length)
	return location.hash
}
    
return {
    deps: {
        pages: 'map',
        routes: 'map',
		tree: 'Sapling',
		fe: "map"
    },
    create: function(deps, params){
        this.super.create.call(this, deps, params)
            
        const rawSpec = []
        const keys = Object.keys(deps.pages)
        for (let i=0,k; (k=keys[i]); i++){
            rawSpec.push(deps.pages[k])
        }
            
        const specMap = this.specMap = {} 
        specMgr.load(this, params, rawSpec, (err, spec)=>{
            for (let i=0, k; (k=keys[i]); i++){
                specMap[k]=spec.shift()
            } 
            router.on('change',pageChanged,this).start(deps.routes, deps.fe.baseurl, extract)
        })  
    }       
}
