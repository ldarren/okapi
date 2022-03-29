const pObj = require('pico/obj')
const base = require('service/okapi/base.json')
const common = require('service/common.json')
const sseSpec = require('service/sse_spec.json')
const sseRoute = require('service/sse_route.json')
const copseRoute = require('service/copse_route.json')
const copse = require('service/copse')
const snodeSpec = require('service/snode_spec.json')
const snodeRoute = require('service/snode_route.json')
const snode = require('service/snode')
const queue = require('service/queue')
const userSpec = require('service/user_spec.json')
const userRoute = require('service/user_route.json')
const system = require('service/system.json')

const out = {}

this.load = () => {
	pObj.extends(out, [
		common,
		sseSpec,
		sseRoute,
		snodeSpec,
		snodeRoute,
		copseRoute,
		userSpec,
		userRoute,
		system,
		{
			snode,
			copse,
			queue,
		},
		base
	], {flat: 1})
}

return out
