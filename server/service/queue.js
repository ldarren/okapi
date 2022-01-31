return {
	query(input, output){
		Object.assign(output, {
			recipient: input.i
		})
		this.next()
	}
}
