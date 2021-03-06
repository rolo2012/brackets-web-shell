/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */


/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, FileError, brackets, unescape, window */

/**
 * Set of utilites for working with files and text content.
 */

define(function (require, exports, module) {
    "use strict";

    var baseFileUtils      = require("file/FileUtils"),
        proxy = require("shell/js/proxy"),
        bracksDir = require("shell/js/native_api_conf").BRACKS_DIR;
    var export_names, i;

    if (bracksDir === undefined) {
        console.log("ERROR: THE SERVER DOSENT RETURN A VALID PATH TO BRAKETS (BRACKS_DIR) ");
    }
        
    
    function remove_slash(str) {
        if (str[str.length - 1] === "/" || str[str.length - 1] === "\\") {
            return str.slice(0, -1);
        }
        return str;
    }
    /**
     * Returns a native absolute path to the 'brackets' source directory.
     * The path must end in /
     * @return {string}
     */
    function getNativeBracketsDirectoryPath() {
        return remove_slash(bracksDir).replace(/\\/g, "/");
    }
    
    //Load all ineherited metods
    export_names = Object.getOwnPropertyNames(baseFileUtils);
    console.log(export_names);
    for (i = 0; i < export_names.length; i++) {

        exports[export_names[i]] = baseFileUtils[export_names[i]];
    }
    //overwrite getNativeBracketsDirectoryPath
    exports.getNativeBracketsDirectoryPath = getNativeBracketsDirectoryPath;

});
