const pObj = require('pico/obj')

const user_spec = {
	"type": "object",
	"spec": {
		"name": {
			"type": "array",
			"required": 1,
			"gt": 0,
			"lt": 5,
			"spec": "string"
		},
		"ccode": {
			"type": "number",
			"gt": 0,
			"lt": 1000
		},
		"mobile": {
			"type": "number",
			"gt": 60000000,
			"lt": 100000000
		},
		"email": {
			"type": "string",
			"regex": "^([a-z]\\w{3,32})@([a-z]\\w{3,16})\\.([a-z]\\w{1,2})$"
		},
		"address": {
			"type": "array",
			"gt": 0,
			"lt": 5,
			"spec": "string"
		}
	}
}

function signup(ctx, body, cb){
	pico.ajax('POST', `${ctx.domain}/1.0/user`, body, ctx.params, (err, state, xhr) => {
		if (4 !== state) return
		if (err) return cb(err)
		let user
		try {
			user = JSON.parse(xhr).body
			ctx.set(user)
		} catch (ex) {
			return cb(ex)
		}
		cb(null, user)
	})
}

return {
	init(deps){
		this.domain = deps.env.domain
		this.params = {
			headers: {
				Authorization: 'basic ' + deps.env.cred
			}
		}

		if (this.modelIndex.length){
			const currUser = this.at(0)
			this.currUserI = currUser.i
		}else{
			const user = pObj.create(user_spec, {randex: RandExp.randexp})
			signup(this, user, (err, currUser) => {
				if (err) return console.error(err)
				this.currUserI = currUser.i
			})
		}
	},
}
