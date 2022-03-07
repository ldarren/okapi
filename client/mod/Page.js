/*
 * Editor Choices
 * https://github.com/mcanam/iblize
 * https://github.com/petersolopov/yace
 * https://github.com/antonmedv/codejar
 */
const {
	EditorView,
	EditorState,
	basicSetup,
} = window.cm

function char2Ele(ele, from, count){
	let fromAt = 0, countAt, l = ele.length, start, end
	if (!ele.length) return [fromAt, countAt, from, count, start, end]
	for (; fromAt < l; fromAt++){
		start = ele.get(fromAt)
		if (from > 0){
			from -= start.length
			if (from >= 0) continue
		}
		if (!count) break
		// offset the chars before 'from'
		count += (start.length + (from ? from : -start.length))
		for (countAt = fromAt; countAt < l; countAt++){
			end = ele.get(countAt)
			if (count <= 0) break
			count -= (end.length)
			if (count <= 0) break
		}
		break
	}
	return [fromAt, countAt, from, count, start, end]
}

function index2At(text, index, deleteCount, insertText){
	const updates = []
	const [insertAt, endAt, from, count, start, end] = char2Ele(text, index, deleteCount)
	if (deleteCount){
		updates.push({insertAt, deleteCount: 1 + endAt - insertAt})
		if (count){
			updates.push({insertAt, insertText: end.slice(end.length + count)})
		}
	}
	if (insertText){
		if (!deleteCount && from) {
			updates.push({insertAt, deleteCount: 1})
			updates.push({insertAt, insertText: start.slice(start.length + from)})
		}
		updates.push({insertAt, insertText})
		if (!deleteCount && from) {
			updates.push({insertAt, insertText: start.slice(0, start.length + from)})
		}
	}
	if (deleteCount){
		if (from){
			updates.push({insertAt, insertText: start.slice(0, start.length + from)})
		}
	}
	return updates
}

function at2Index(text, at){
	let index = 0
	for (let val of text) {
		if (!at) break
		index += val.length
		at--
	}
	return index
}

function count2Char(text, at, count){
	let chr = 0
	for (let val of text) {
		if (!count) break
		if (at) at--
		else {
			chr += val.length
			count--
		}
	}
	return chr
}

function form2Obj(form){
	const obj = {}
	for(let i = 0, l = form.length, input; i < l; i++){
		input = form[i]
		obj[input.name] = input.value
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

function submit(evt){
	const form = evt.target.closest('form')
	const obj = form2Obj(form)
	const headers = obj.headers.reduce((acc, o) => {
		Object.assign(acc, JSON.parse(o))
		return acc
	}, {})

	const req = form.querySelector('div.editor .cm-content').textContent
	__.ajax(obj.method, obj.url, req, {headers}, (err, state, xhr) => {
		if (4 > state) return
		form[form.length - 1].value = xhr
	})
}

function blur(ctx, evt){
	const form = evt.target.closest('form')
	const obj = form2Obj(form)

	const merge2 = Automerge.change(ctx.merge, doc => {
		doc.method = obj.method
		doc.url = obj.url
		obj.headers.forEach((h, i) => doc.headers[i] = h)
	})

	const changes = Automerge.getChanges(ctx.merge, merge2)
	if (!changes.length) return
	ctx.merge = merge2
	ctx.server.update(changes)
}

function updateUI(form, merge){
	for (let i = 0, l = form.length, input; i < l; i++){
		input = form[i]
		switch(input.name){
		case 'method':
			input.value = merge.method
			break
		case 'url':
			input.value = merge.url
			break
		case 'h1':
			input.value = merge.headers[0] || ''
			break
		case 'r1':
			input.value = 0
			break
		case 'h2':
			input.value = merge.headers[1] || ''
			break
		case 'r2':
			input.value = 0
			break
		}
	}
}

return {
	deps: {
		tpl: 'file',
		snode: 'snode',
		behest: 'model',
	},
	create(deps, params){
		this.el.innerHTML=deps.tpl(deps.behest)

		this.view = new EditorView({
			state: EditorState.create({
				doc: this.deps.behest.req, //this.merge.req.toString(),
				extensions: [
					basicSetup,
					EditorView.updateListener.of(v => {
						// exclude changes from non-user, non-user event === am
						if (v.transactions.some(t => t.isUserEvent('am'))) return
						const changes = this.cm2am(v)
						if (changes) server.update(changes)
					}),
				]
			}),
			parent: this.el.querySelector('div.editor')
		})

		// TODO: sync snode
		//deps.snode.sync()
		deps.snode.callback.on('update', () => {
			const [merge] = Automerge.applyChanges(Automerge.init(), state)
			this.merge = merge
		}, this)
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
				Object.assign(this.deps.behest, obj)
			})
		}
	},

	cm2am(v){
		// validation
		if (!v.docChanged) return
		const arr = v.changes.toJSON()
		if (!Array.isArray(arr)) return

		let merge2 = Automerge.merge(Automerge.init(), this.merge)
		let index = 0
		let replace = null
		let insertText = null
		let updates
		// update AutoMerge
		for (let i = 0, l = arr.length; i < l; ){
			if (Array.isArray(arr[i])){
				replace = arr[i++]
			}else{
				index += arr[i++]
				replace = arr[i++]
			}
			if (!replace) break
			const [deleteCount, ...insertTexts] = replace
			insertText = insertTexts.join('\n')

			updates = index2At(merge2.req, index, deleteCount, insertText)

			console.log('cm2am merge2 before', index, deleteCount, insertText, merge2.req.toString())
			merge2 = Automerge.change(merge2, doc => {
				updates.forEach(u => {
					if (u.deleteCount) doc.req.deleteAt(u.insertAt, u.deleteCount)
					if (u.insertText) doc.req.insertAt(u.insertAt, u.insertText)
				})
			})
			console.log('cm2am merge2 after', merge2.req.toString())

			index += insertText.length
		}

		const changes = Automerge.getChanges(this.merge, merge2)
		this.merge = merge2
		return changes
	},

	am2cm(patch){
		console.log('client receive ######', this.merge, patch)
		// create changes and sent to upstream
		const [merge2, patch2] = Automerge.applyChanges(Automerge.merge(Automerge.init(), this.merge), patch)
		const merge = this.merge
		this.merge = merge2

		console.log('am2cm merge2', merge2, patch2)
		updateUI(this.form, merge2)

		const props = patch2.diffs.props
		if (!props.req) return
		const text = props.req
		const cm = this.view
		for (let key in text){
			let index
			text[key].edits.forEach(diff => {
				const changes = {}
				index = at2Index(merge2.req, diff.index)
				switch (diff.action) {
				case 'insert':
					changes.from = index
					changes.to = index
					changes.insert = diff.value.value
					break
				case 'remove':
					changes.from = index
					changes.to = index + count2Char(merge.req, diff.index, diff.count)
					changes.insert = ''
					break
				}
				// update codemirror
				cm.dispatch(cm.state.update({
					changes,
					//effects: [],
					//filter: false,
					remote: true,
					userEvent: 'am'
				}))
				console.log('cm', changes, cm.state.doc.toString())
			})
		}
	},
}
