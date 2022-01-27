return {
	test(ctx){
		return function(){
			this.test('util.networkInterface works with minimal input', cb => {
				const res = []
				const func = ctx.util.networkInterface()
				func.call(ctx, null, res)
				if (!res.length) return cb(null, false)
				const out = res[0]
				cb(null, out.address && out.family && null != out.internal)
			})
		}
	}
}
