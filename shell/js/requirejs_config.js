/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, $, window, document*/

var require = {
    deps: ['shell/js/appshell_extensions']
};
(function () {
    'use strict';
    var scripts = document.getElementsByTagName("script"),
        params = scripts[scripts.length - 1];
    params.get = params.getAttribute;
    /**
     *  Configurations options
     */
    var NativeApiConf = params.get('conf-url'),
        to_override = [
            "editor/CodeHintManager",
            "file/FileUtils"
        ],
        map = {
            "*": {}
        },
        shell_path = "../../shell/",
        over_path = "../../shell/js/brack_extend/",
        index;
    if (!NativeApiConf) {
        throw "You must set the configuration url in the conf-url atribute of the require.js <script> tag.";
    }
    for (index = 0; index < to_override.length; index++) {
        var path = to_override[index];
        map["*"][path] = over_path + path;//change the script reference to a new file
        if (map[over_path + path] === undefined) {
            map[over_path + path] = {};
        }
        map[over_path + path][path] = path;//exept in the overriden file
    }
    //adds the server config to the map
    map["*"].NativeApiConf = NativeApiConf;
    require.map = map;
    require.paths = {
        'shell': shell_path,
        "text" : "thirdparty/text",
        "i18n" : "thirdparty/i18n"

    };
    require.callback = function () {
        require(['brackets']);
    };
}());

/*
MAP EXAMPLE
map: {
        "*": {
            "editor/CodeHintManager":
                "../../shell/js/brack_extend/editor/CodeHintManager",
            "file/FileUtils":
                "../../shell/js/brack_extend/file/FileUtils"
        },
        "../../shell/js/brack_extend/editor/CodeHintManager":
            {
                "editor/CodeHintManager":
                    "editor/CodeHintManager"
            },
        "../../shell/js/brack_extend/file/FileUtils":
            {
                "file/FileUtils":
                    "file/FileUtils"
            }
    },
 */