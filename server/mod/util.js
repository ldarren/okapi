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
		return this
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
		if (!rs) return this.next(`unsupprted resource: ${params.rsc}`)
		const idx = params.i ? '/i' : ''
		const name = `${method}/${params.rsc}${idx}`
		await this.next(null, name, Object.assign({
			params,
			rs
		}, this.data))
		return this.next()
	},

	input: spec => function(input, output, ext) {
		const err = pObj.validate(spec, input, output, ext)
		if (err) return this.next(`invalid params [${err}]`)
		return this.next()
	},

	input2(input, spec, output, ext) {
		const err = pObj.validate(spec, input, output, ext)
		if (err) return this.next(`invalid params [${err}]`)
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
		const lib = pLib.export(id)
		const func = lib[funcName]
		if (!func) throw `${funcName} not found in ${id}`

		return function(...args){
			func.apply(lib, args)
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

	add(value, key, output){
		output[key] = value
		return this.next()
	},

	async detour(url, data){
		await this.next(null, url, data)
		return this.next()
	},

	branch(url, data){
		this.next(null, url, data)
	},

	deadend(err){
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
			if (key) addrs.reduce((acc, net) => {
				acc.push(net[key]); return acc
			}, output)
			else output.push(...addrs)
			this.next()
		}
	}
}
