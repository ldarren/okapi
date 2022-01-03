import {nodeResolve} from '@rollup/plugin-node-resolve'
export default {
	input: './cm.build.js',
	output: {
		file: './lib/cm.js',
		format: 'iife'
	},
	plugins: [nodeResolve()]
}
