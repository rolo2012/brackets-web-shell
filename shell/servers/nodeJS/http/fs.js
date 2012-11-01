/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global exports, require, process*/

var trycatch = require("trycatch");
var fs = require("fs");
var path = require("path");
var promise = require("node-promise/promise");

var NO_ERROR = 0;
var ERR_UNKNOWN = 1;
var ERR_INVALID_PARAMS = 2;
var ERR_NOT_FOUND = 3;
var ERR_CANT_READ = 4;
var ERR_UNSUPPORTED_ENCODING = 5;
var ERR_CANT_WRITE = 6;
var ERR_OUT_OF_SPACE = 7;
var ERR_NOT_FILE = 8;
var ERR_NOT_DIRECTORY = 9;


function _convertError(error) {
    "use strict";
    if (!error) {
        return NO_ERROR;
    }
    switch (error.errno) {
    case 18: // EINVAL
        return ERR_INVALID_PARAMS;
    case 34: // ENOENT
        return ERR_NOT_FOUND;
    case 3: // EACCESS
        return ERR_CANT_READ;
    case 54: // ENOSPC
    case 56: // EROFS
        return ERR_OUT_OF_SPACE;
    case 28: // EISDIR
    case 50: // EPERM
        return ERR_NOT_FILE;
    case 27: // ENOTDIR
        return ERR_NOT_DIRECTORY;
    }
    return ERR_UNKNOWN;
}

// wrap a function that takes a callback as the last parameter to instead return a promise
function _wrap(method) {
    "use strict";
    return function () {
        var r = promise.defer();
        var args = Array.prototype.slice.call(arguments, 0);

        // ensure that all arguments are set, except the last one
        while (args.length < method.length - 1) {
            args.push(undefined);
        }

        // add a custom callback
        args.push(function () {
            var response = Array.prototype.slice.call(arguments, 0);

            // convert error objects to Brackets error codes
            response[0] = _convertError(response[0]);
            r.resolve(response);
        });

        // call the method
        trycatch(
            function () {
                method.apply(undefined, args);
            },
            function (error) {
                var code;
                if (error instanceof TypeError) {
                    code = ERR_INVALID_PARAMS;
                } else if (error.message === "Unknown encoding") {
                    code = ERR_UNSUPPORTED_ENCODING;
                } else {
                    code = ERR_UNKNOWN;
                }
                r.resolve([code]);
            }
        );
        return r;
    };
}


// file stats
function get_file_modification_time(path, callback) {
    "use strict";
    fs.stat(path, function (err, statData) {
        var rtndata = {};
        if (statData && callback) {
            // store the values of the extra StatData functions
            /*statData._isFile = statData.isFile();
            statData._isDirectory = statData.isDirectory();
            statData._isBlockDevice = statData.isBlockDevice();
            statData._isCharacterDevice = statData.isCharacterDevice();
            statData._isFIFO = statData.isFIFO();
            statData._isSocket = statData.isSocket();*/
            
            rtndata.isDir = statData.isDirectory();
            rtndata.modtime = statData.mtime.getTime() / 1000;
        }
        if (callback) {
            callback(err, rtndata);
        }
    });
}
function isWindows() {
    "use strict";
    return (process.getgid === undefined);
}

function get_top_dirs(callback) {
    "use strict";
    var drive_leters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        drives = [],
        drive,
        i;
    console.log("WINWIN");
    if (isWindows()) {
        for (i = 0; i < drive_leters.length; i++) {
            drive = drive_leters[i] + ":";
            try {
                fs.statSync(drive);
                drives.push(drive);
            } catch (e) {
                    
            }
        }
            
    } else {
        drives.push('/');
    }
    callback(0, drives);
}

function add_slash(str) {
    "use strict";
    if (str[str.length - 1] !== "/") {
        return str + "/";
    }
    return str;
}

function read_dir_dirs(path, callback) {
    "use strict";
    //A litle pach readdir dosen't work whit absolute paths  
    var cwd_hold = process.cwd();
    try {process.chdir("/"); } catch (e) {}
    fs.readdir(path, function (err, files) {
        //Restore the actual dir
        try {process.chdir(cwd_hold); } catch (e) {}
        var statData, dirs, abs_file, i;
        if (files && callback) {
            dirs = [];
            for (i = 0; i < files.length; i++) {
                try {
                    abs_file = add_slash(path) + files[i];
                    statData = fs.statSync(abs_file);
                    if (statData.isDirectory()) {
                        dirs.push(abs_file);
                    }
                } catch (error) {
                    
                }
            }
                        
        }
        if (callback) {
            callback(err, dirs);
        }
    });
}

function read_dir_files(path, callback) {
    "use strict";
    //A litle pach readdir dosen't work whit absolute paths  
    var cwd_hold = process.cwd();
    try {process.chdir("/"); } catch (e) {}
    fs.readdir(path, function (err, files) {
        //Restore the actual dir
        try {process.chdir(cwd_hold); } catch (e) {}
        var statData, res_files, abs_file, i;
        if (files && callback) {
            res_files = [];
            for (i = 0; i < files.length; i++) {
                try {
                    abs_file = add_slash(path) + files[i];
                    statData = fs.statSync(abs_file);
                    if (statData.isFile() || statData.isSymbolicLink()) {
                        res_files.push(abs_file);
                    }
                } catch (error) {
                    
                }
            }
                        
        }
        if (callback) {
            callback(err, res_files);
        }
    });
}


// current working directory
function _cwd(callback) {
    "use strict";
    callback(undefined, path.resolve());
}

// export error codes
exports.NO_ERROR = NO_ERROR;
exports.ERR_UNKNOWN = ERR_UNKNOWN;
exports.ERR_INVALID_PARAMS = ERR_INVALID_PARAMS;
exports.ERR_NOT_FOUND = ERR_NOT_FOUND;
exports.ERR_CANT_READ = ERR_CANT_READ;
exports.ERR_UNSUPPORTED_ENCODING = ERR_UNSUPPORTED_ENCODING;
exports.ERR_CANT_WRITE = ERR_CANT_WRITE;
exports.ERR_OUT_OF_SPACE = ERR_OUT_OF_SPACE;
exports.ERR_NOT_FILE = ERR_NOT_FILE;
exports.ERR_NOT_DIRECTORY = ERR_NOT_DIRECTORY;

// export functions
exports.read_dir = _wrap(fs.readdir);
exports.get_file_modification_time = _wrap(get_file_modification_time);
exports.read_file = _wrap(fs.readFile);
exports.write_file = _wrap(fs.writeFile);
exports.set_posix_permissions = _wrap(fs.chmod);
exports.delete_file_or_dir = _wrap(fs.unlink);
exports.rename = _wrap(fs.rename);
exports.cwd = _wrap(_cwd);
//OpenDialog
exports.get_top_dirs = _wrap(get_top_dirs);
exports.read_dir_dirs = _wrap(read_dir_dirs);
exports.read_dir_files = _wrap(read_dir_files);
