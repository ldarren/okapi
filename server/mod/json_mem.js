const pObj = require('pico-common').export('pico/obj')
let KEY

/**
 * Database class
 *
 * @param {object} host - host object
 *
 * @returns {void} - this
 */
function Database(host){
	this.host = host
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

/**
 * Collection class
 *
 * @param {Database} db - database object
 * @param {object} meta - meta object
 * @param {object} rs - resource
 *
 * @returns {void} - this
 */
function Collection(db, meta, rs){
	this.db = db
	this.index = 1
	this.documents = []
	this.meta = Object.assign({}, meta, rs.meta)
	this.schema = Object.assign({}, rs.schema)
	this.map = Object.assign({}, rs.map)
	this.ref = Object.assign({}, rs.ref)
	this.child = rs.child ? rs.child.slice() : void 0
}

Collection.prototype = {
	insert(input){
		const i = this.index++
		const meta = {
			i,
			s: 1,
			cby: 0,
			cat: new Date
		}
		const d = {}  // TODO: add ext dependencies based on this.map?
		const res = pObj.validate(this.schema, input, d)
		if (res) throw `invalid parameter: ${res}`

		if (Array.isArray(this.child)){
			this.child.forEach(childName => {
				const child = d[childName]
				if (Array.isArray(child)){
					child.forEach(c => this.db.getColl(childName).insert(Object.assign({[childName]: i}, c)))
				}else{
					this.db.getColl(childName).insert(Object.assign({[childName]: i}, child))
				}
				delete d[childName]
			})
		}

		this.documents.push(Object.assign(meta, {d}))
		return meta
	},
	select(q){
		const docs = this.documents
		if (!Array.isArray(q.csv)) return docs.slice()
		return q.csv.map(i => docs.find(item => i === item.i)).filter(item => item)
	},
	update(i, d){
		const doc = this.documents.find(item => i === item.i)
		if (!doc) return
		Object.assign(doc, {
			d,
			uby: 0,
			uat: new Date
		})
	},
	remove(i){
		for (let j = 0, d, docs = this.documents; (d = docs[j]); j++){
			if (i === d.i){
				d.s = 0
				break
			}
		}
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
 * @param {object} ctx - context object
 * @param {string} dbName - name of database that contain the interested collection
 * @param {string} collName - name of the collection
 *
 * @returns {Collection} - Collection instance
 */
function getColl(ctx, dbName, collName){
	const db = ctx[dbName]
	const coll = db.getColl(collName)
	if (!coll) throw `Invalid ${dbName} ${collName}`
	return coll
}

module.exports = {
	setup(host, cfg, rsc, paths){
		KEY = cfg.id
		const meta = cfg.meta
		return Object.keys(rsc).reduce((acc, name) => {
			const rs = rsc[name]
			if (!rs) return acc
			acc.addColl(name, new Collection(acc, meta, rs))
			return acc
		}, new Database(host))
	},
	set(name, id, input, output){
		const coll = getColl(this, KEY, name)
		if (Array.isArray(input)){
			sets(coll, id, input, output)
		}else{
			set(coll, id, input, output)
		}
		return this.next()
	},
	get(name, id, output){
		const coll = getColl(this, KEY, name)
		const res = coll.select({index: 'i', csv: [id]})
		Object.assign(output, res[0])
		return this.next()
	},
	find(name, query, output){
		const coll = getColl(this, KEY, name)
		output.push(...coll.select(query))
		return this.next()
	},
	hide(name, id){
		const coll = getColl(this, KEY, name)
		coll.remove(id)
		return this.next()
	}
}
