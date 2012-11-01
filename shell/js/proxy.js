/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, $, window, brackets, WebSocket */

define(function (require, exports, module) {
    "use strict";
    var NativeApiConf = require("NativeApiConf");
    var _socket;
    var _messageId = 1;
    var _messageQueue = [];
    var _messageCallbacks = {};


    /**
     * Bridge to php server ajax_api
     * @param func_name Name of the funcion in the server
     * @param params array of parameters to the php function or a parameter if only one
     * @param callback funtion(data)  data is object whit 2 fields data.error and data.data
     */
    function remoteCallAjax(func_name, params, callback) {
        var data_type = NativeApiConf.DATA_FORMAT === NativeApiConf.RETURN_DATA_JSON ? "json" : "jsonp";
        $.ajax({
            url: NativeApiConf.CALL_URL + '/' + func_name,
            cache: false,
            dataType: data_type,
            type: 'POST',
            data: {
                params: params,
                func_name: func_name
            }
        }).done(function (data) {
            callback(data);
        }).fail(function (data) {
            
        });
    }

    /**
     * WebSocket implementation from the bracket in browser branch
     */

    // received message from the node server
    function _onmessage(data) {
        if (data.type === "message") {
            var msg = JSON.parse(data.data);
            var out = {};
            var id = msg.id;
            if (_messageCallbacks[id]) {
                if (msg.response[0]) {
                    out.error = msg.response[0];
                }
                if (msg.response[1]) {
                    out.data = msg.response[1];
                }
                if (!out.error) {
                    out.error = 0;
                }
                _messageCallbacks[id].call(undefined, out);
                delete _messageCallbacks[id];
            }
        }
    }
    // on websocket open
    function _onopen(event) {
        var i;
        // execute all pending requests
        for (i in _messageQueue) {
            if (_messageQueue.hasOwnProperty(i)) {
                _socket.send(JSON.stringify(_messageQueue[i]));
            }
        }
        _messageQueue = [];
    }
    
    // on websocket closed
    function _onclose(event) {
        module.connect();
    }

    // on websocket error
    function _onerror(event) {
    }
    // connect to the node server
    function connect() {
        //_socket = new WebSocket("ws://" + window.location.host.replace(/:[0-9] + $/,'') + ":9000");
        _socket = new WebSocket(NativeApiConf.CALL_URL);
        _socket.onopen = _onopen;
        _socket.onerror = _onerror;
        _socket.onclose = _onclose;
        _socket.onmessage = _onmessage;
    }

    // forward the method for the module to the node server
    function send(module, method) {
        var args = Array.prototype.slice.call(arguments, 2);
        var id;
        if (typeof args[args.length - 1] === "function") {
            id = _messageId++;
            _messageCallbacks[id] = args.pop();
        } else {
            id = 0;
        }
        var msg = {
            id: id,
            module: module,
            method: method,
            args: args
        };
        if (_socket.readyState !== 1) {
            _messageQueue.push(msg);
        } else {
            _socket.send(JSON.stringify(msg));
        }
    }

    function remoteCallWebSocket(func_name, params, callback) {
        //All the functions are in the fs module
        params = ["fs", func_name].concat(params);
        params.push(callback);
        return send.apply(undefined, params);
    }
    if (NativeApiConf.CONEXION_TYPE === NativeApiConf.CONEXION_HTTP) {
        exports.remoteCall = remoteCallAjax;
    } else if (NativeApiConf.CONEXION_TYPE === NativeApiConf.CONEXION_WS) {
        connect();
        exports.remoteCall = remoteCallWebSocket;
    }

});
