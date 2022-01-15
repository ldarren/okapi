const os = require('os')
const pLib = require('pico-common')
const pObj = pLib.export('pico/obj')
const randex = require('randexp').randexp

/**
 * Group object's array to array objects
 *
 * @param {object} input - parsed querystring
 * @param {Array} grouping - keys to be group
 * @param {Array} output - output array
 * @returns {Array} - output array
 */
function groupQuery(input, grouping, output = []){
	for (let i = 0, keys, val0; (keys = grouping[i]); i++){
		val0 = input[keys[0]]
		if (!val0) continue
		if (Array.isArray(val0)){
			for (let j = 0, l = val0.length; j < l; j++){
				output.push(keys.reduce((acc, key) => {
					acc[key] = input[key][j]
					return acc
				}, {}))
			}
		}else{
			output.push(keys.reduce((acc, key) => {
				acc[key] = input[key]
				return acc
			}, {}))
		}
	}
	return output
}

module.exports = {
	setup(host, cfg, rsc, paths){
	},

	async wait(sec){
		await new Promise((resolve, reject) => {
			setTimeout(resolve, sec)
		})
		return this.next()
	},

	log(...args) {
		// eslint-disable-next-line no-console
		console.log(...args)
		return this.next()
	},

	router: rsc => async function(method, params) {
		const rs = rsc[params.rsc]
		if (!rs) return this.next(`unsupprted key: ${params.rsc}`)
		const indi = params.id ? '/id' : ''
		const name = `${method}/rsc${indi}`
		await this.next(null, name, Object.assign({
			params,
			rs
		}, this.data))
		return this.next()
	},

	input: spec => function(input, output, ext) {
		const error = pObj.validate(spec, input, output, ext)
		if (error) return this.next(`invalid params [${error}]`)
		return this.next()
	},

	input2(input, spec, output, ext) {
		const error = pObj.validate(spec, input, output, ext)
		if (error) return this.next(`invalid params [${error}]`)
		return this.next()
	},

	group(input, grouping, output){
		if (Array.isArray(grouping) && grouping.length){
			Object.assign(output, {group: groupQuery(input, grouping)}, input)
		} else {
			Object.assign(output, input)
		}
		return this.next()
	},

	extend(...args){
		const output = args.pop()
		pObj.extends(output, args)
		return this.next()
	},

	lib: (id, funcName) => {
		const func = pLib.export(id)[funcName]

		return function(...args){
			func(...args)
			return this.next()
		}
	},

	push(array, ...item){
		array.push(...item)
		return this.next()
	},

	spawn(schema, ext, count, output){
		const opt = Object.assign({randex}, ext)
		for(let i = 0; i < count; i++){
			output.push(pObj.create(schema, opt))
		}
		return this.next()
	},

	spawn_tree(schema, ext, layer, output){
		// TODO: spawn tree structure with ${layer} layers
		// do we need this if each node is a row?
		return this.next()
	},

	add(value, key, output){
		output[key] = value
		return this.next()
	},

	async go(url, data){
		await this.next(null, url, data)
		return this.next()
	},

	die(err){
		this.next(err)
	},

	networkInterface(name, cond = {}){
		const filter = addr => Object.keys(cond).every(key => cond[key] === addr[key])
		const ni = os.networkInterfaces()
		const addrs = Object.keys(ni).reduce((acc, key) => {
			if (name && name !== key) return acc
			const list = ni[key]
			acc.push(...list.filter(filter))
			return acc
		}, [])

		return function(key, output){
			addrs.reduce((acc, net) => {
				acc.push(net[key])
				return acc
			}, output)
			this.next()
		}
	}
}
