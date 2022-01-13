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

function row(d, meta, map){
	const obj = {}
	if (map){
		Object.keys(map).reduce((acc, k) => {
			acc[k] = d[map[k]]
			return acc
		}, obj)
	}
	return Object.assign(obj, meta, {d})
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
	insert(input){
		const d = {}
		const res = pObj.validate(this.schema, input, d)
		if (res) throw `invalid parameter: ${res}`

		const meta = {
			i: this.index++,
			s: 1,
			cby: 0,
			cat: new Date
		}
		this.documents.push(row(d, meta, this.map))
		this.save()
		return meta
	},
	update(i, d){
		const doc = this.documents.find(item => i === item.i)
		if (!doc) return
		Object.assign(doc, row(d, {
			uby: 0,
			uat: new Date
		}, this.map))
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
 * @param {object} output - result of the set
 *
 * @returns {void} - undefined
 */
function set(coll, id, input, output){
	if (id){
		coll.update(id, input)
		Object.assign(output, {id})
	}else{
		const res = coll.insert(input)
		Object.assign(output, res)
	}
}

/**
 * Set multiple records into collection
 *
 * @param {Collection} coll - Collection instance
 * @param {Array} ids - array of identity of the record, can be string or number
 * @param {Array} inputs - records to be set
 * @param {Array} outputs - results of the sets
 *
 * @returns {void} - undefined
 */
function sets(coll, ids, inputs, outputs){
	if (ids){
		ids.forEach((id, i) => {
			coll.update(id, inputs[i])
			outputs.push({id})
		})
	}else{
		inputs.forEach(input => {
			const res = coll.insert(input)
			outputs.push(res)
		})
	}
}

/**
 * Get Collection by database name and collection name
 *
 * @param {object} ctx - context
 * @param {string} dbiName - name of the database that contain the interested collection
 * @param {string} collName - name of the collection
 *
 * @returns {Collection} - Collection instance
 */
function getColl(ctx, dbName, collName){
	const db = ctx[dbName]
	if (!db) throw `Invalid ${dbName}`
	const coll = db.getColl(collName)
	if (!coll) throw `Invalid ${dbName}.${collName}`
	return coll
}

module.exports = {
	setup(host, cfg, rsc, paths){
		return Object.keys(rsc).reduce((acc, name) => {
			const rs = rsc[name]
			if (!rs || acc.name !== rs.db) return acc
			acc.addColl(name, new Collection(acc, name, rs))
			return acc
		}, new Database(cfg))
	},
	set(key, name, id, input, output){
		const coll = getColl(this, key, name)
		set(coll, id, input, output)
		return this.next()
	},
	sets(key, name, id, input, output){
		const coll = getColl(this, key, name)
		if (Array.isArray(input)){
			sets(coll, id, input, output)
		}else{
			set(coll, id, input, output)
		}
		return this.next()
	},
	get(key, name, id, output){
		const coll = getColl(this, key, name)
		const res = coll.select({index: 'i', csv: [id]})
		Object.assign(output, res[0])
		return this.next()
	},
	find(key, name, query, output){
		const coll = getColl(this, key, name)
		output.push(...coll.select(query))
		return this.next()
	},
	hide(key, name, id){
		const coll = getColl(this, key, name)
		coll.remove(id)
		return this.next()
	},
	truncate(key, name, size){
		const coll = getColl(this, key, name)
		coll.truncate(size)
		return this.next()
	}
}
