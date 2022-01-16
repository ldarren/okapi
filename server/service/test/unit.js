return {
	test(ctx){
		return function(){
			this.test('util.networkInterface works with minimal input', async cb => {
				const res = []
				const func = ctx.util.networkInterface()
				func.call(ctx, null, res)
				if (!res.length) return cb(null, false)
				const out = res[0]
				cb(null, out.address && out.family && void 0 != out.internal)
			})
/*
			this.test('product list', async cb => {
				const output = []
				await ctx.next(null, 'fetch/so', {params: {page: 1, size: 25}, output})
				cb(null, output.body && Array.isArray(output.body))
			})
*/
		}
	}
}
