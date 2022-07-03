# Service DSL
A DSL is created to define a service characteristics by specifying following objects
- data specification: xxx\_spec.json
- workflow: xxx\_route.json
- utility functions: xxx.js

## Data Specification
data spec defined the database, incoming and outgoing data format

## Workflow
workflow defined the workflow in http request, timer trigger

## Utilities
utility functions run in pico env

## Index
There are two ways to index a service
- JSON
- JS

### JSON Way
JSON way is for simple to define a service

Example index.json
```json
[
	"./base.json",
	"../tree_spec.json",
	"../tree_route.json"
]
```

### JS Way
If custom JS script is requred in a service, servive has to setup with index.js

Example
```js
const pObj = require('pico/obj')
const base = require('service/okapi/base.json')
const treeSpec = require('service/tree_spec.json')
const treeRoute = require('service/tree_route.json')
const tree = require('service/tree')

const out = {}

this.load = () => {
	pObj.extends(out, [
		treeSpec,
		treeRoute,
		{
			tree,
		},
		base
	], {flat: 1})
}

return out
```

## Test
