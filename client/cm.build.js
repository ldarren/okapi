import {EditorView, keymap, highlightSpecialChars, drawSelection, highlightActiveLine} from '@codemirror/view'
import {EditorState } from '@codemirror/state'

import {basicSetup} from '@codemirror/basic-setup'
import {history, historyKeymap} from '@codemirror/history'
import {foldGutter, foldKeymap} from '@codemirror/fold'
import {indentOnInput} from '@codemirror/language'
import {lineNumbers, highlightActiveLineGutter} from '@codemirror/gutter'
import {defaultKeymap,indentWithTab} from '@codemirror/commands'
//import {bracketMatching} from '@codemirror/matchbrackets'
import {closeBrackets, closeBracketsKeymap} from '@codemirror/closebrackets'
import {searchKeymap, highlightSelectionMatches} from '@codemirror/search'
import {autocompletion, completionKeymap} from '@codemirror/autocomplete'
import {commentKeymap} from '@codemirror/comment'
import {rectangularSelection} from '@codemirror/rectangular-selection'
import {defaultHighlightStyle} from '@codemirror/highlight'
import {lintKeymap} from '@codemirror/lint'

window.cm = {
	EditorView,
	EditorState,
	// see https://github.com/codemirror/basic-setup/blob/main/src/basic-setup.ts
	basicSetup,
	liteSetup: [
		lineNumbers(),
		highlightActiveLineGutter(),
		highlightSpecialChars(),
		history(),
		foldGutter(),
		drawSelection(),
		EditorState.allowMultipleSelections.of(true),
		indentOnInput(),
		defaultHighlightStyle.fallback,
		//bracketMatching(), // causing bracket auto open
		closeBrackets(),
		autocompletion(),
		rectangularSelection(),
		highlightActiveLine(),
		highlightSelectionMatches(),
		keymap.of([
			...closeBracketsKeymap,
			...defaultKeymap,
			...searchKeymap,
			...historyKeymap,
			...foldKeymap,
			...commentKeymap,
			...completionKeymap,
			...lintKeymap,
			indentWithTab,
		])
	],
}
