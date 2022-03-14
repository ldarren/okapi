<span>
	<label for="gen">Create a shareable key: </label>
	<input type="button" name="gen" id="gen" value="Create" <%d.ref ? 'disabled' : ''%>>
</span>
<span>
	<label for="ref">Input a shareable key: </label>
	<input type="button" nmae="ref" id="ref" value="Input" <%d.ref ? 'disabled' : ''%>>
</span>
<span>
	<label for="rem">Remove shareable key: </label>
	<input type="button" nmae="rem" id="rem" value="Remove" <%d.ref ? '' : 'disabled'%>>
</span>
<span>
	<label for="group">Key: </label>
	<input type="text" name="group" id="group" value="<%d.ref || ''%>" readonly>
</span>
