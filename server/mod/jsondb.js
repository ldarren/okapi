const fs = require('fs')
const path = require('path')
const pObj = require('pico-common').export('pico/obj')

/**
 * Database class
 *
 * @param {object} cfg - cfg object
 *
 * @returns {void} - this
 */
function Database(cfg){
	this.name = cfg.id
	const dir = cfg.dir
	if (!fs.statSync(dir, {throwIfNoEntry: false})) {
		fs.mkdirSync(dir, {recursive: true})
	}
	this.dir = cfg.dir
	this.colls = {}
}

Database.prototype = {
	addColl(name, coll){
		this.colls[name] = coll
	},
	getColl(name){
		return this.colls[name]
	}
}

function map(d, meta, map){
	if (!map) return
	return Object.keys(map).reduce((acc, k) => {
		acc[k] = d[map[k]]
		return acc
	}, {})
}

function row(d, meta){
	return Object.assign({}, meta, {d})
}

/**
 * Collection class
 *
 * @param {Database} db - database object
 * @param {string} name - collection name
 * @param {object} rs - resource
 * @param {string} rs.db - resource db name, see mod.id
 * @param {string} rs.map - map resource fields to meta
 * @param {object} rs.schema - resource schema
 *
 * @returns {void} - this
 */
function Collection(db, name, rs){
	this.db = db
	this.fname = path.join(db.dir, name + '.json')
	const json = fs.readFileSync(this.fname, {flag: 'a+'})
	const doc = json.length ? JSON.parse(json) : []
	this.documents = doc
	this.index = doc.length ? doc[doc.length - 1].i + 1 : 1
	this.meta = Object.assign({}, rs.meta || {})
	this.map = rs.map || Object.assign({}, rs.map)
	this.schema = Object.assign({}, rs.schema)
}

Collection.prototype = {
	select(q){
		const docs = this.documents
		if (!Array.isArray(q.csv)) return docs.slice()
		return q.csv.map(i => docs.find(item => i === item.i)).filter(item => item)
	},
	save(){
		fs.writeFileSync(this.fname, JSON.stringify(this.documents))
	},
	insert(input, meta){
		const d = 'array' === this.schema.type ? [] : {}
		let res = pObj.validate(this.schema, input, d)
		if (res) throw `invalid parameter: ${res}`

		let m = {}
		if (this.meta.type){
			res = pObj.validate(this.meta, map(d, this.map, meta), m)
			if (res) throw `invalid meta: ${this.meta}, ${res}`
		}
		m = Object.assign({
			i: this.index++,
			s: 1,
			cby: 0,
			cat: new Date
		}, m)

		this.documents.push(row(d, m))
		this.save()
		return m
	},
	update(i, d, meta){
		const doc = this.documents.find(item => i === item.i)
		if (!doc) return

		let m = {}
		if (this.meta.type){
			let res = pObj.validate(this.meta, map(d, this.map, meta), m)
			if (res) throw `invalid meta: ${this.meta}, ${res}`
		}
		m = Object.assign({
			uby: 0,
			uat: new Date
		}, m)

		Object.assign(doc, row(d, m))
		this.save()
	},
	remove(i){
		for (let j = 0, d, docs = this.documents; (d = docs[j]); j++){
			if (i === d.i){
				d.s = 0
				d.uat = new Date
				d.uby = 0
				break
			}
		}
		this.save()
	},
	truncate(size){
		this.documents = this.documents.slice(-size)
		this.save()
		return this.documents.length
	}
}

/**
 * Set single record into collection
 *
 * @param {Collection} coll - Collection instance
 * @param {string} id - identity of the record, can be string or number
 * @param {object} input - record to be set
 * @param {object} meta - meta object of data
 * @param {object} output - result of the set
 *
 * @returns {void} - undefined
 */
function set(coll, id, input, meta, output){
	if (id){
		coll.update(id, input, meta)
		Object.assign(output, {id})
	}else{
		const res = coll.insert(input, meta)
		Object.assign(output, res)
	}
}

/**
 * Set multiple records into collection
 *
 * @param {Collection} coll - Collection instance
 * @param {Array} ids - array of identity of the record, can be string or number
 * @param {Array} inputs - records to be set
 * @param {Array} metas - meta data of recards
 * @param {Array} outputs - results of the sets
 *
 * @returns {void} - undefined
 */
function sets(coll, ids, inputs, metas, outputs){
	if (ids){
		ids.forEach((id, i) => {
			coll.update(id, inputs[i], metas[i])
			outputs.push({id})
		})
	}else{
		inputs.forEach((input, i) => {
			const res = coll.insert(input, metas[i])
			outputs.push(res)
		})
	}
}

module.exports = {
	setup(host, cfg, rsc, paths){
		const db = new Database(cfg)
		return Object.keys(rsc).reduce((acc, name) => {
			const rs = rsc[name]
			if (!rs || db.name !== rs.db) return acc
			const coll = new Collection(db, name, rs)
			db.addColl(name, coll)
			acc[name] = coll
			return acc
		}, {})
	},
	set(coll, id, input, meta, output){
		set(coll, id, input, meta, output)
		return this.next()
	},
	sets(coll, id, input, meta, output){
		if (Array.isArray(input)){
			sets(coll, id, input, meta, output)
		}else{
			set(coll, id, input, meta, output)
		}
		return this.next()
	},
	get(coll, id, output){
		const res = coll.select({index: 'i', csv: [id]})
		Object.assign(output, res[0])
		return this.next()
	},
	find(coll, query, output){
		output.push(...coll.select(query))
		return this.next()
	},
	hide(coll, id){
		coll.remove(id)
		return this.next()
	},
	truncate(coll, size){
		coll.truncate(size)
		return this.next()
	}
}
