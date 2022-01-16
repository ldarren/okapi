const pObj = require('pico/obj')
const base = require('service/okapi/base.json')
const common = require('service/common.json')
const treeSpec = require('service/tree_spec.json')
const treeRoute = require('service/tree_route.json')
const tree = require('service/tree')
const system = require('service/system.json')

const out = {}

this.load = () => {
	pObj.extends(out, [
		common,
		treeSpec,
		treeRoute,
		system,
		{
			tree
		},
		base
	], {flat:1})
}

return out
