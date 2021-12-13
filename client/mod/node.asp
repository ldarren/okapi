<%const da=d.data;%>
<input type="checkbox" id="<%d.id%>" <%da.checked ? "checked" : ""%> />
<label class="tree_label <%d.sel ? " sel": ""%>" for="<%d.id%>"><%da.name%></label>
<ul></ul>
