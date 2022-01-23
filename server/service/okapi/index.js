const pObj = require('pico/obj')
const base = require('service/okapi/base.json')
const common = require('service/common.json')
const sseRoute = require('service/sse_route.json')
const treeSpec = require('service/tree_spec.json')
const treeRoute = require('service/tree_route.json')
const tree = require('service/tree')
const userSpec = require('service/user_spec.json')
const userRoute = require('service/user_route.json')
const system = require('service/system.json')

const out = {}

this.load = () => {
	pObj.extends(out, [
		common,
		sseRoute,
		treeRoute,
		treeSpec,
		treeRoute,
		userSpec,
		userRoute,
		system,
		{
			tree
		},
		base
	], {flat:1})
}

return out
