const pObj = require('pico/obj')
const base = require('@/base.json')
const unit = require('@/unit')
const treeSpec = require('~/tree_spec.json')

const out = {}

this.load = () => {
    pObj.extends(out, [base, treeSpec, {unit}])
}

return out
