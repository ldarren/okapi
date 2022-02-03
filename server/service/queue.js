return {
	query(input, output){
		Object.assign(output, {
			recipient: input.i
		})
		return this.next()
	}
}
