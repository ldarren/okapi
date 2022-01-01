const pObj = require('pico/obj')
const base = require('service/okapi/base.json')
const common = require('service/common.json')
const treeCfg = require('service/tree.json')
const tree = require('service/tree')
const system = require('service/system.json')

const out = {}

this.load = () => {
	pObj.extends(out, [common, treeCfg, system, {tree}, base], {flat:1})
}

return out
