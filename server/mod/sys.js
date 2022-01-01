module.exports = {
	setup(host, cfg, rsc, paths){
	},
	record(output){
		Object.assign(output, process.resourceUsage())
		this.next()
	}
}
