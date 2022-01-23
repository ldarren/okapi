module.exports = {

	setup(host, cfg, rsc, paths){
	},

	verify(req, user){
		Object.assign(user, {i: 1})
		this.next()
	},

}
