# OK.API Client

## Setup
- install eslint globally
- npm ci
- npm start

### Build codemirror
- update @codemirror/basic-setup
- edit cm.build.js and rollup.config.js wherever needed
- npm run build:cm

### Build Automerge
- git clone https://github.com/automerge/automerge.git
- cd automerge
- npm ci
- npm run build
- cp dist/\* to {okapi/client}/lib

### Startup
- load or create a new user (sync to server)
- load okapi app's default data (from server)
- load default data on client, but lazy load innernode with reference
- 
