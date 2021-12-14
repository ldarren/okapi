function form2Obj(form){
	const obj = {}
	for(let i = 0, l = form.length, input; i < l; i++){
		input = form[i]
		obj[input.name] = input.value
		console.log(input.name, input.value)
	}
	const arr = []
	if (obj.h1) arr.push(obj.h1)
	if (obj.h2){
		if (obj.r1 >= obj.r2) arr.push(obj.h2)	
		else arr.unshift(obj.h2)	
	}
	obj.headers = arr
	return obj
}

return {
	deps: {
		tpl: 'file',
		snode: 'snode',
		settings: 'models',
		request: 'model',
	},
	create(deps, params){
		this.el.innerHTML=deps.tpl()
		debugger
	},
	events: {
		'click input[type=button]': function(e, target){
			const form = e.target.closest('form')
			const obj = form2Obj(form)
			const headers = obj.headers.reduce((acc, o) => {
				Object.assign(acc, JSON.parse(o))
				return acc
			}, {})

			//const req = form.querySelector('div.editor .cm-content').textContent
			__.ajax(obj.method, obj.url, obj.req, {headers}, (err, state, xhr) => {
				if (4 > state) return
				form[form.length - 1].value = xhr
			})
		}
	}
}
