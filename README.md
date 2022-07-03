# CRDT Sync Process

## Glossary
CRDT doc - CRDT object that contains changes make to the document

## Frontend
frontend should keep two CRDT docs:
* backendEdge
* frontendEdge

- initialise frontendEdge with localstorage with readonly support
- when visible: get backend doc and initialise frontendEdge and backendEdge, and enable editing
- on update trigger: Automerge.change frontendEdge, Automerge.getChanges backendEdge and frontendEdge. send the changes to backend
- // skip? when ack: merge backendEdge to frontendEdge
- when sse update: applyChanges to backendEdge and merge backendEdge to frontendEdge

## Backend
frontend shoudl keep one CRDT doc

- initialise, load doc from db and populate CRDT doc if not yet, always use Automerge.getAllChanges and send changes tofrontned
- when update: appliChanges to CRDT doc and broadcast changes
- when timer tick: save to db
- when server power down: save to db
