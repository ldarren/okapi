<%if (d.ref) {%>
<span>
	<label for="group">Reference Key: </label>
	<input type="text" name="group" id="group" value="<%d.ref || ''%>" readonly>
</span>
<%} else {%>
<span>
	<label for="gen">Create a shareable key: </label>
	<input type="button" name="gen" id="gen" value="Create" <%d.org ? 'disabled' : ''%>>
</span>
<span>
	<label for="org">Input a shareable key: </label>
	<input type="button" name="org" id="org" value="Input" <%d.org ? 'disabled' : ''%>>
</span>
<span>
	<label for="rem">Remove shareable key: </label>
	<input type="button" name="rem" id="rem" value="Remove" <%d.org ? '' : 'disabled'%>>
</span>
<span>
	<label for="group">Key: </label>
	<input type="text" name="group" id="group" value="<%d.org || ''%>" readonly>
</span>
<%}%>
