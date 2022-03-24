const pObj = require('pico/obj')
const base = require('service/okapi/base.json')
const common = require('service/common.json')
const sseRoute = require('service/sse_route.json')
const chatSpec = require('service/chat_spec.json')
const chatRoute = require('service/chat_route.json')
const chat = require('service/chat')
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
		sseRoute,
		chatRoute,
		chatSpec,
		snodeSpec,
		snodeRoute,
		userSpec,
		userRoute,
		system,
		{
			snode,
			queue,
			chat
		},
		base
	], {flat: 1})
}

return out
