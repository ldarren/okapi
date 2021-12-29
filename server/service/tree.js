return {
	router(method, id){
console.log('####router', method, id)
		switch(method){
		case 'GET':
			if (id) return this.next(null, `GET/tree/${id}`)
			return this.next(null, 'LIST/tree')
		case 'POST':
			return this.next(null, 'NEW/tree')
		case 'PUT':
			return this.next(null, `UPD/tree/${id}`)
		case 'DELETE':
			return this.next(null, `REM/tree/${id}`)
		}
	}
}
