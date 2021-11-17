<%for (let i = 0, item; (item = d[i]); i++){ %>
<li><button id="<%item.id%>"><%item.name%></button></li>
<%}%>
