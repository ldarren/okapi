const BASIC = 'Basic '
const BASE64 = 'base64'

module.exports = {

	setup(host, cfg, rsc, paths){
	},

	verify({authorization}, user){
		if (!authorization || !authorization.includes(BASIC)) return this.next('Not auth')
		const b64 = authorization.substring(BASIC.length)
		const buff = Buffer.from(b64, BASE64)
		const text = buff.toString()
		const cred = text.split(':')

		Object.assign(user, {i: parseInt(cred[0])})
		return this.next()
	},

}
