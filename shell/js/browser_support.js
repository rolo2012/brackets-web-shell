/*jslint vars: true, plusplus: true, devel: true, browser: true, nomen: true, indent: 4, forin: true, maxerr: 50, regexp: true */
/*global define, $*/
define(function (require, exports, module) {
    "use strict";
    /**
     * FileError FIX FOR MOZILLA 14+
     */
    if (!window.FileError) {
        if (window.DOMError) {
            window.FileError = window.DOMError;
        }
    }
    /**
     * Fix for links with href #  if you set <base href="page_x"> the linsk point to page_x#
     * Prevent to page_x#
     */
    $(function () {
        $(document).on('click', "a[href='#']", function (e) {
            e.preventDefault();
        });
    });
});