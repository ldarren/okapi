return {
	init(deps){
		this.users = deps.users
	},
	byKey(key, cb){
		this.users.request('GET', `/1.0/tree/${key}`, null, null, cb)
	},
	byRoot(cb){
		this.users.request('GET', `/1.0/user/${this.users.loginId}/tree`, null, null, cb)
	}
}
