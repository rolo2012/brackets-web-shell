/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, __dirname*/
var config = require("./config");
var DEBUG = true;

var http = require("http");
var WebSocketServer = require('ws').Server;

function _logError() {
    "use strict";
    console.error.apply(console, arguments);
}

function _log() {
    "use strict";
    if (DEBUG) {
        console.log.apply(console, arguments);
    }
}

function _handleMessage(ws, message) {
    "use strict";
    var messageObj = JSON.parse(message);
    _log(messageObj.module + "." + messageObj.method + "(" + messageObj.args.join() + ")");
    var module = require("./" + messageObj.module);
    var handler = module[messageObj.method];
    var response = handler.apply(null, messageObj.args);
    if (response && typeof response.then === "function") {
        response.then(function (response) {
            _log("->", response);
            ws.send(JSON.stringify({ id: messageObj.id, response: response }));
        }, function (error) {
            _logError(error);
        });
    } else {
        ws.send(JSON.stringify({ id: messageObj.id, response: response }));
    }
}

// set up the web socket server
var wss = new WebSocketServer({ host: http.INADDR_ANY, port: config.ws_port });
_log("Brackets Node Server listening on port " + config.ws_port);
wss.on('connection', function (ws) {
    "use strict";
    ws.on('message', function (message) {        
        try {
            _handleMessage(ws, message);
        } catch (error) {
            _logError(error);
        }
    });
});




/*
 * For configuratun file 
 * This must be sincronous
 * I dont how use with websockets
 */
http.createServer(function (req, res) {
    "use strict";
    var json = {
            "RETURN_DATA_JSON": 0,
            "RETURN_DATA_JSONP": 1,
            "DATA_FORMAT" : 0,
            "CALL_URL" : "ws://localhost:" + config.ws_port + "/",
            "SERVER_TYPE": 'node_ws',
            "CONEXION_HTTP": 0,
            "CONEXION_WS": 1,
            "CONEXION_TYPE": 1,
            "BRACKS_DIR": get_bracket_dir()
        };
    res.setHeader("Content-Type", "application/javascript");
    res.end("define(" + JSON.stringify(json) + ")");
}).listen(config.http_port);