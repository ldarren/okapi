<span>
	<label for="name">Name: </label>
	<input type="text" name="name" id="name" value="/" required>
</span>
<span>
	<label for="method">Method: </label>
	<input type="text" name="method" id="method" value="GET" required>
</span>
<span>
	<label for="url">URL: </label>
	<input type="text" name="url" id="url" value="https://httpbin.org/headers" required>
</span>
<span>
	<label for="h1">Header: </label>
	<input type="text" name="h1" id="h1" value='{"Content-Type":"application/json"}'>
</span>
<span>
	<label for="h2">Header: </label>
	<input type="text" name="h2" id="h2">
</span>
<span>
	<label for="req">Request: </label>
	<!--<div class=editor></div>-->
	<textarea name="req" id="req" rows="5" cols="80"></textarea>
</span>
<span>
	<input type="button" value="Send">
</span>
<span>
	<label for="res">Response: </label>
	<textarea name="res" id="res" rows="5" cols="80" readonly disabled></textarea>
</span>
