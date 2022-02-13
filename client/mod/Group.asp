<span>
	<label for="gen">Create a shareable key: </label>
	<input type="button" name="gen" id="gen" value="Create" <%d.key ? 'disabled' : ''%>>
</span>
<span>
	<label for="ref">Input a shareable key: </label>
	<input type="button" nmae="ref" id="ref" value="Input" <%d.key ? 'disabled' : ''%>>
</span>
<span>
	<label for="rem">Remove shareable key: </label>
	<input type="button" nmae="rem" id="rem" value="Remove" <%d.key ? '' : 'disabled'%>>
</span>
<span>
	<label for="group">Key: </label>
	<input type="text" name="group" id="group" value="<%d.key || ''%>" readonly>
</span>
