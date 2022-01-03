const {
    EditorView,
    EditorState,
    liteSetup,
} = window.cm

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
		this.el.innerHTML=deps.tpl(deps.request)
		this.view = new EditorView({
			state: EditorState.create({
				doc: this.deps.request.req, //this.merge.req.toString(),
				extensions: [
					liteSetup,
					EditorView.updateListener.of(v => {
						/*if (v.transactions.some(t => t.isUserEvent('am'))) return
						const changes = this.cm2am(v)
						if (!changes) return
						server.update(changes)*/
					}),
				]
			}),
			parent: this.el.querySelector(`div.editor`)
		})
	},
	remove(){
		this.view.destroy()
		this.super.remove.call(this)
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

				obj.res = xhr
				obj.headers = JSON.stringify(obj.headers)
				Object.assign(this.deps.request, obj)
			})
		}
	}
}
