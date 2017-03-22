WS_PORT = 8888;
if (typeof console == "undefined") {    this.console = { log: function (msg) {  } };}
WEB_SOCKET_SWF_LOCATION = "/swf/WebSocketMain.swf";
WEB_SOCKET_DEBUG = true;
var ws, name, client_list={},timeid, reconnect=false,limitCount;