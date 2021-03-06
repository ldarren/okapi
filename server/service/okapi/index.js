const pObj = require('pico/obj')
const base = require('service/okapi/base.json')
const common = require('service/common.json')
const sseRoute = require('service/sse_route.json')
const chatSpec = require('service/chat_spec.json')
const chatRoute = require('service/chat_route.json')
const chat = require('service/chat')
const treeSpec = require('service/tree_spec.json')
const treeRoute = require('service/tree_route.json')
const tree = require('service/tree')
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
		treeRoute,
		treeSpec,
		treeRoute,
		userSpec,
		userRoute,
		system,
		{
			tree,
			queue,
			chat
		},
		base
	], {flat: 1})
}

return out
