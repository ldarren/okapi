return {
	router(method, i){
console.log('#### tree router', method, i)
		switch(method){
		case 'GET':
			if (i) return this.next(null, `GET/tree/${i}`)
			return this.next(null, 'LIST/tree')
		case 'POST':
			return this.next(null, 'NEW/tree')
		case 'PUT':
			return this.next(null, `UPD/tree/${i}`)
		case 'DELETE':
			return this.next(null, `REM/tree/${i}`)
		}
	},
	meta(ip, output){
		Object.assign(output, {host_ip: ip[0]})
		this.next()
	}
}
