/*jslint vars: true, plusplus: true, devel: true, browser: true, nomen: true, indent: 4, forin: true, maxerr: 50, regexp: true */
(function () {
    'use strict';
    var pathname, directory, current_dir, filename;
    var scripts = document.getElementsByTagName("script"),
        params = scripts[scripts.length - 1];
    params.get = params.getAttribute;
    
    if (window.location.protocol === "file:") {
        var redir_script = document.querySelector('script[redir_port]'),
            port = params.get("redir-port") ? ":" + params.get("redir-port") : "";
        pathname = window.location.pathname;
        directory = pathname.substr(0, pathname.lastIndexOf("/"));
        filename = pathname.substr(pathname.lastIndexOf("/") + 1, pathname.length);
        current_dir = params.get('in-root') ? "" : directory.substr(directory.lastIndexOf("/") + 1, directory.length) + "/";
        window.location.replace('http://localhost' + port + "/" + current_dir + filename);
    }
}());
