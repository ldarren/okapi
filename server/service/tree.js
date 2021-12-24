return {
	router(method, id){
		switch(method){
		case 'GET':
			return this.next(null, 'LIST/tree')
		case 'POST':
			return this.next(null, 'NEW/tree')
		case 'PUT':
			return this.next(null, 'UPD/tree')
		case 'DELETE':
			return this.next(null, 'REM/tree')
		}
	}
}
