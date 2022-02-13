return {
	init(deps){
		this.domain = deps.env.domain
		this.option = {
			headers: {
				Authorization: deps.env.cred
			}
		}
	},
	send(id, body){
		const url = `${this.domain}/1.0/chat/${id}`
		pico.ajax('PUT', url, body, this.option, (err, state, xhr) => {
			if (state < 4) return
			if (err) console.error(err)

		})
	}
}
