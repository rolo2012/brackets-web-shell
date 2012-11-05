/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, __dirname */
var config = {
    http_port : 5900
};
var DEBUG = true;

var http = require("http"),
    path = require("path"),
    fs = require('fs'),
    qs = require('querystring');

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

function _handleMessage(res, $REQUEST) {
    "use strict";

    var module = require("./fs");
    var handler = module[$REQUEST.func_name];
    if (!handler || typeof handler !== "function") {
        console.log($REQUEST.func_name + "METHOD  NOT FOUND");
        res.end();
        return;
    }

    if ($REQUEST.params === undefined && $REQUEST['params[]'] !== undefined) {
        $REQUEST.params = $REQUEST['params[]'];
    }
    if ($REQUEST.params === undefined) {
        $REQUEST.params = [];
    }
    if (!Array.isArray($REQUEST.params)) {
        $REQUEST.params = [$REQUEST.params];
    }
    var response = handler.apply(null, $REQUEST.params);
    if (response && typeof response.then === "function") {
        response.then(function (response) {
            var out = {};
            if (response[0]) {
                out.error = response[0];
            }
            if (response[1]) {
                out.data = response[1];
            }
            if (!out.error) {
                out.error = 0;
            }
            res.end(JSON.stringify(out));
        }, function (error) {
            _logError(error);
        });
    } else {
        res.end(JSON.stringify(response));
    }
}

function get_bracket_dir() {
    "use strict";
    return path.normalize(__dirname + "/../../../../adobe-brackets/src");
}

function ouput_config(res,$GET) {
    "use strict";
    var json = {
        error:0,
        data:{
            "RETURN_DATA_JSON" : 0,
            "RETURN_DATA_JSONP": 1,
            "DATA_FORMAT" : 0,
            "CALL_URL" : "http://localhost:" + config.http_port + "/apicall",
            "SERVER_TYPE": 'node_ajax',
            "CONEXION_HTTP" : 0,
            "CONEXION_WS" : 1,
            "CONEXION_TYPE" : 0,
            "BRACKS_DIR" : get_bracket_dir()
        }
    };
    var js = JSON.stringify(json);
    if($GET['callback']){
        js= $GET['callback']+"("+js+")";
    }
    res.setHeader("Content-Type", "application/javascript");
    res.end(js);
}
/*
 * For configuratun file
 * This must be sincronous
 * I dont how use with websockets
 */
http.createServer(function (req, res) {
    "use strict";
    req.addListener("data", function (chunk) {
        //console.log("chunk"+chunk);
        if (!req.content) {
            req.content = "";
        }
        if (chunk) {
            req.content += chunk;
        }
    });
    req.addListener("end", function () {
        var file_path, request, $GET = [], $POST = [];
        var query = req.url.split('?');
        if (query.length > 1) {
            query = query[query.length - 1];
            $GET = qs.parse(query);
        }
        if (req.url.match(/\/apicall\/configure(\?.*)?/)) {
            ouput_config(res,$GET);
        } else if (req.url.match(/^\/apicall(\/[a-zA-Z_][a-zA-Z0-9_]*)?$/)) {
            if (req.content) {
                $POST = qs.parse(req.content);
            }
            if (req.content) {
                request = $POST;
            } else {
                request = $GET;
            }
            _handleMessage(res, request);
        } else {
            //Serve file
            file_path = path.normalize(get_bracket_dir() + "/../../" + req.url);
            try {
                var data = fs.readFileSync(file_path);
                res.end(data);
            } catch (e) {
                console.log("not found path", file_path);
                res.end("<H1>The file " + req.url + " not found in this server or you don't have permisions.</H1>");
            }
        }
    });
}).listen(config.http_port);
console.log("LISTEN TO " + config.http_port);
