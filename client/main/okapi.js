pico.run({
	name: 'okapi',
	ajax: __.ajax,
	onLoad: __.load,
	env: Object.assign(
		{ build: 'prod' },
		(function(el){
			return el && el.dataset ? el.dataset : {}
		})(document.getElementById('pEnv'))
	),
	preprocessors:{
		'.asp':function(url,asp){
			return pico.export('pico/str').template(asp)
		}
	},
	baseurl: location.href,
	paths:{
		'~': './mod/',
		ext: './ext/',
		root: './',
		main: './main/',
		cfg: './cfg/',
		p: './lib/pico/',
		po: './lib/pojs/'
	}
},function(){
	var specMgr= require('p/specMgr')
	var View= require('p/View')
	var project = require('cfg/okapi.json')
	var host = require('cfg/okapi.'+ pico.env('build') +'.json')
	var main

	return function(){
		specMgr.load(null, null, project, function(err, spec){
			if (err) return console.error(err)
			main = new View('_host', host, null, [])
			main.spawnBySpec(spec)
		})
	}
})
