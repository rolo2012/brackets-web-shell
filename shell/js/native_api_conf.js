/*jslint vars : true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr:  50 */
/*global $, document, window, navigator, define */
/*
 * Implements a replacement for the native functions of brackets shell
 *
 */
define(function (require, exports, module) {
    "use strict";
    var
        RETURN_DATA_JSON = 0,
        RETURN_DATA_JSONP = 1,
        CONEXION_HTTP = 0,
        CONEXION_WS = 1,
        CONEXION_TYPE,
        BRACKS_DIR,
        DATA_FORMAT = 0,
        CALL_URL;
    function init(href, callback) {
        var a = $("<a>"),
            proxy = require('shell/js/proxy');
        a.attr('href', href);
        a = a[0];
        CONEXION_TYPE = a.protocol === "http:" ? CONEXION_HTTP : CONEXION_TYPE;
        CONEXION_TYPE = a.protocol === "ws:" ? CONEXION_WS : CONEXION_TYPE;
        CALL_URL = href;
        DATA_FORMAT = CONEXION_TYPE === CONEXION_HTTP ? RETURN_DATA_JSONP : RETURN_DATA_JSON;
        proxy.config({
            CONEXION_TYPE: CONEXION_TYPE,
            CALL_URL: CALL_URL,
            DATA_FORMAT: DATA_FORMAT
        });
        proxy.remoteCall('configure', [], function (data) {
            if (data.data) {
                proxy.config(data.data);
                if (data.data.BRACKS_DIR) {
                    BRACKS_DIR = data.data.BRACKS_DIR;
                    exports.BRACKS_DIR = BRACKS_DIR;
                }
                callback();
            }
        });
    }
    exports.RETURN_DATA_JSON = RETURN_DATA_JSON;
    exports.RETURN_DATA_JSONP = RETURN_DATA_JSONP;
    exports.CONEXION_HTTP = CONEXION_HTTP;
    exports.CONEXION_WS = CONEXION_WS;
    exports.CONEXION_TYPE = CONEXION_TYPE;
    exports.BRACKS_DIR = BRACKS_DIR;
    exports.DATA_FORMAT = DATA_FORMAT;
    exports.CALL_URL = CALL_URL;
    exports.init = init;
});

