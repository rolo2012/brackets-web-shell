/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, $, window, brackets, WebSocket */

define(function (require, exports, module) {
    "use strict";
    //var NativeApiConf = require("NativeApiConf");
    var _socket;
    var _messageId = 1;
    var _messageQueue = [];
    var _messageCallbacks = {};
    var is_conected = false;

    var
    RETURN_DATA_JSON = 0,
    RETURN_DATA_JSONP = 1,
    CONEXION_HTTP = 0,
    CONEXION_WS = 1,
    CONEXION_TYPE,
    DATA_FORMAT = 0,
    CALL_URL = 0;
     
     
    function config(conf) {        
        if (conf) {
            if (conf.CONEXION_TYPE!==undefined) {
                CONEXION_TYPE = conf.CONEXION_TYPE;                
            }
            if (conf.DATA_FORMAT!==undefined) {
                DATA_FORMAT = conf.DATA_FORMAT;
            }
            if (conf.CALL_URL!==undefined) {
                CALL_URL = conf.CALL_URL;
            }
        }
    }

    /**
     * Bridge to php server ajax_api
     * @param func_name Name of the funcion in the server
     * @param params array of parameters to the php function or a parameter if only one
     * @param callback funtion(data)  data is object whit 2 fields data.error and data.data
     */
    function remoteCallAjax(func_name, params, callback) {
        var data_type = DATA_FORMAT === RETURN_DATA_JSON ? "json" : "jsonp";
        $.ajax({
            url: CALL_URL + '/' + func_name,
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
        connect();
    }

    // on websocket error
    function _onerror(event) {
        is_conected=false;
    }
    // connect to the node server
    function connect() {
        //_socket = new WebSocket("ws://" + window.location.host.replace(/:[0-9] + $/,'') + ":9000");        
        _socket = new WebSocket(CALL_URL);
        _socket.onopen = _onopen;
        _socket.onerror = _onerror;
        _socket.onclose = _onclose;
        _socket.onmessage = _onmessage;
        is_conected=true;
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
        if(!is_conected){
            connect();
        }
        params = ["fs", func_name].concat(params);
        params.push(callback);
        return send.apply(undefined, params);
    }
    
    function  remoteCall(func_name, params, callback) {         
        if (CONEXION_TYPE === CONEXION_HTTP) {
            return remoteCallAjax(func_name, params, callback);
        } else if (CONEXION_TYPE === CONEXION_WS) {
            return remoteCallWebSocket(func_name, params, callback);
        }        
        throw "Uknow conexion type";
    }
    exports.remoteCall = remoteCall;
    exports.remoteCallAjax = remoteCallAjax;
    exports.remoteCallWebSocket= remoteCallWebSocket;    
    exports.config = config;
});
