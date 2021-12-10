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
    
return {
    deps: {
        pages: 'map',
        routes: 'map',
		tree: 'Sapling'
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
            router.on('change',pageChanged,this).start(deps.routes, location.pathname)
        })  
    }       
}
