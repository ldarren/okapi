/*
 * Automerge API Doc
 * API Ver: Latest commit eae0f79 on 13 Feb
 *
 * No Automerge doc can be found yet on the internet, this doc serve as self quick reference of the things I discovered when studying the Automerge codebase
 */

/*
 * Glossary
 *
 * Frontend - a document interface
 * backend - CRDT operations, it is mutable, can be overridden with setDefaultBackend()
 */

/**
 * @module
 * 
 * Properties of the document root object
 * @prop _options - object containing options passed to init()
 * @prop _cache - map from objectId to immutable object
 * @prop _state - object containing metadata about current state (e.g. sequence numbers)
 * @prop backend - instance of backend
 * Properties of all Automerge objects
 * @prop {string} _objectId - the object ID of the current object (string)
 * @prop _conflicts - map or list (depending on object type) of conflicts
 * @prop _change - the context object on proxy objects used in change callback
 * @prop _elemIds - list containing the element ID of each list element
 */
var Doc = {
	_objectId: '_root',
	_options: {
		actorId: 'string',
		deferActorId: 'string',
		observable: {patchCallback: () => {}},
		patchCallback: () => {},
	},
	_conflicts: {},
	_cache: {_root: doc},
	_state: {seq: 0, maxOp: 0, requests: [], clock: {}, deps: []},
	backend: Backend
}

/**
 * creates a new, empty document
 *
 * @access public
 * @param {object|string} [options={}] - actorId
 * @param {string} [options.actorId] - actorId
 * @param {string} [options.deferActorId] - actorId
 * @param {object} [options.observable] - object with a patchCallback method
 * @param {Function} [options.patchCallback] - callback when ever Frontend.applyPatch
 * @returns {Doc} - a new and empty document
 * @throws {TypeError} - `Unsupported options for init(): ${options}`
 */
function init(options) {
  return Doc
}

/**
 * Returns a new document object initialized with the given state.
 * from = init + change
 *
 * @access public
 * @param {object} initialState - initial state of object to be CRDT
 * @param {object|string} [options={}] - options will be pass to init()
 * @returns {Doc} - a new doc with initState
 * @throws {TypeError} - `Unsupported options for init(): ${options}`
 */
function from(initialState, options) {
	return Doc
}

/**
 * local change
 *
 * @access public
 * @param {Doc} doc - document to be applied the change
 * @param {object|string} [options={}] - {message: 'Initialization'} 
 * @param {Function} callback - callback with a mutable doc (proxy)
 * @returns {Doc} - a new doc with changes apply by callback
 */
function change(doc, options, callback) {
  return Doc
}

function emptyChange(doc, options) {
  const [newDoc] = Frontend.emptyChange(doc, options)
  return newDoc
}

function clone(doc, options = {}) {
  const state = backend.clone(Frontend.getBackendState(doc, 'clone'))
  return applyPatch(init(options), backend.getPatch(state), state, [], options)
}

function free(doc) {
  backend.free(Frontend.getBackendState(doc, 'free'))
}

function load(data, options = {}) {
  const state = backend.load(data)
  return applyPatch(init(options), backend.getPatch(state), state, [data], options)
}

function save(doc) {
  return backend.save(Frontend.getBackendState(doc, 'save'))
}

function merge(localDoc, remoteDoc) {
  const localState = Frontend.getBackendState(localDoc, 'merge')
  const remoteState = Frontend.getBackendState(remoteDoc, 'merge', 'second')
  const changes = backend.getChangesAdded(localState, remoteState)
  const [updatedDoc] = applyChanges(localDoc, changes)
  return updatedDoc
}

/**
 * 
 *
 * @param {doc} oldDoc
 */
function getChanges(oldDoc, newDoc) {
  const oldState = Frontend.getBackendState(oldDoc, 'getChanges')
  const newState = Frontend.getBackendState(newDoc, 'getChanges', 'second')
  return backend.getChanges(newState, backend.getHeads(oldState))
}

function getAllChanges(doc) {
  return backend.getAllChanges(Frontend.getBackendState(doc, 'getAllChanges'))
}

function applyPatch(doc, patch, backendState, changes, options) {
  const newDoc = Frontend.applyPatch(doc, patch, backendState)
  const patchCallback = options.patchCallback || doc[OPTIONS].patchCallback
  if (patchCallback) {
    patchCallback(patch, doc, newDoc, false, changes)
  }
  return newDoc
}

function applyChanges(doc, changes, options = {}) {
  const oldState = Frontend.getBackendState(doc, 'applyChanges')
  const [newState, patch] = backend.applyChanges(oldState, changes)
  return [applyPatch(doc, patch, newState, changes, options), patch]
}

function equals(val1, val2) {
  if (!isObject(val1) || !isObject(val2)) return val1 === val2
  const keys1 = Object.keys(val1).sort(), keys2 = Object.keys(val2).sort()
  if (keys1.length !== keys2.length) return false
  for (let i = 0; i < keys1.length; i++) {
    if (keys1[i] !== keys2[i]) return false
    if (!equals(val1[keys1[i]], val2[keys2[i]])) return false
  }
  return true
}

function getHistory(doc) {
  const actor = Frontend.getActorId(doc)
  const history = getAllChanges(doc)
  return history.map((change, index) => ({
      get change () {
        return decodeChange(change)
      },
      get snapshot () {
        const state = backend.loadChanges(backend.init(), history.slice(0, index + 1))
        return Frontend.applyPatch(init(actor), backend.getPatch(state), state)
      }
    })
  )
}

function generateSyncMessage(doc, syncState) {
  const state = Frontend.getBackendState(doc, 'generateSyncMessage')
  return backend.generateSyncMessage(state, syncState)
}

function receiveSyncMessage(doc, oldSyncState, message) {
  const oldBackendState = Frontend.getBackendState(doc, 'receiveSyncMessage')
  const [backendState, syncState, patch] = backend.receiveSyncMessage(oldBackendState, oldSyncState, message)
  if (!patch) return [doc, syncState, patch]

  // The patchCallback is passed as argument all changes that are applied.
  // We get those from the sync message if a patchCallback is present.
  let changes = null
  if (doc[OPTIONS].patchCallback) {
    changes = backend.decodeSyncMessage(message).changes
  }
  return [applyPatch(doc, patch, backendState, changes, {}), syncState, patch]
}

function initSyncState() {
  return backend.initSyncState()
}

/**
 * Replaces the default backend implementation with a different one.
 * This allows you to switch to using the Rust/WebAssembly implementation.
 */
function setDefaultBackend(newBackend) {
  backend = newBackend
}

module.exports = {
  init, from, change, emptyChange, clone, free,
  load, save, merge, getChanges, getAllChanges, applyChanges,
  encodeChange, decodeChange, equals, getHistory, uuid,
  Frontend, setDefaultBackend, generateSyncMessage, receiveSyncMessage, initSyncState,
  get Backend() { return backend }
}

for (let name of ['getObjectId', 'getObjectById', 'getActorId',
     'setActorId', 'getConflicts', 'getLastLocalChange',
     'Text', 'Table', 'Counter', 'Observable', 'Int', 'Uint', 'Float64']) {
  module.exports[name] = Frontend[name]
}
