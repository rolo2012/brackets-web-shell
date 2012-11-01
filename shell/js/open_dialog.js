/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global $, document, window, navigator, define, brackets,  Mustache*/

define(function (require, exports, module) {
    "use strict";

    var OpenDlgView   = require("text!shell/open_dlg_view.html"),
        AppInit                 = require("utils/AppInit"),
        templateVars            = require("i18n!nls/strings"),
        proxy = require('shell/js/proxy');

    var DIALOG_ID_OPEN_FILE = "open-file-dialog",
        DIALOG_ID_OPEN_FOLDER = "open-folder-dialog";

    require("thirdparty/jstree_pre1.0_fix_1/jquery.jstree");

    var tree_node_id = 1;
    function _convertEntriesToJSON(entries) {
        var jsonEntryList = [],
            entry,
            entryI;

        for (entryI = 0; entryI < entries.length; entryI++) {
            entry = entries[entryI];
            var jsonEntry = {
                data: entry.name,
                attr: {
                    id: "tree_node" + tree_node_id++
                },
                state : "closed",
                metadata: {
                    entry: entry
                }
            };

            jsonEntryList.push(jsonEntry);
        }
        return jsonEntryList;
    }

    function _convertsPathsToEntries(paths) {

        var entryList = [],
            path,
            entryI;
        for (entryI = 0; entryI < paths.length; entryI++) {
            var entry = {},
                bas_name;
            path = paths[entryI];
            /**
         * @todo corract the json encode and remove this
         * Patch for the no utf8 path that return null
         */
            if (path) {
                entry.name =
                    entry.fullPath = path;
                bas_name = path.match("[^\/]*$")[0];
                if (bas_name && bas_name !== "") {
                    entry.name = bas_name;
                }
                entryList.push(entry);
            }
        }
        return entryList;
    }
    function getDirFiles(path, callback) {
        proxy.remoteCall('read_dir_files', [path], function (data) {
            if (!data.data) {
                console.log("Error#" + data.error);
                return;
            }
            callback(data.data);
        });
    }

    function getDirDirs(path, callback) {

        proxy.remoteCall('read_dir_dirs', [path], function (data) {
            if (!data.data) {
                console.log("Error#" + data.error);
                return;
            }
            callback(data.data);
        });
    }

    function getTopDirs(jsTreeCallback) {
        proxy.remoteCall('get_top_dirs', [], function (data) {
            if (!data.data) {
                jsTreeCallback({});
                return;
            }
            var dirs = data.data;
            var entries, jsonTree;
            entries = _convertsPathsToEntries(dirs);
            jsonTree = _convertEntriesToJSON(entries);
            jsTreeCallback(jsonTree);
        });
    }

    
    
    function treeDataProvider(treeNode, jsTreeCallback) {

        var dirEntry, isProjectRoot = false;
        if (treeNode === -1) {
            // Special case: root of tree
            getTopDirs(jsTreeCallback);
            return;
        } else {
            // All other nodes: the DirectoryEntry is saved as jQ data in the tree (by _convertEntriesToJSON())
            dirEntry = treeNode.data("entry");
            getDirDirs(dirEntry.fullPath, function (paths) {
                var entries = _convertsPathsToEntries(paths);
                var subtreeJSON = _convertEntriesToJSON(entries);
                var emptyDirectory = (subtreeJSON.length === 0);
                if (emptyDirectory) {
                    treeNode.removeClass("jstree-closed jstree-open")
                        .addClass("jstree-leaf");
                }
                jsTreeCallback(subtreeJSON);

            }, jsTreeCallback);
        }
    }

    function createTree(node, file_view) {
        var tree = node.jstree(
            {
                plugins : ["ui", "themes", "json_data", "crrm", "sort"],
                json_data : {
                    data: treeDataProvider,
                    correct_state: false
                },
                core : {
                    animation: 0
                },
                themes : {
                    //theme: "apple",
                    dots: false
                },
                strings : {
                    loading : "Loading ...",
                    new_node : "New node"
                }
            }
        )
            .bind("select_node.jstree", function (e, data) {
                var $node = $(this);
                $node.jstree("toggle_node", data.rslt.obj);
                var entry = data.rslt.obj.data('entry');
                if (file_view) {
                    getDirFiles(entry.fullPath, function (files) {
                        var $file_view = $node.siblings('.file_view');
                        $file_view.empty();
                        var list = $("<ul/>"),
                            entries = _convertsPathsToEntries(files),
                            i;
                        list.attr('id', 'file_list');
                        for (i = 0; i < entries.length; i++) {
                            var list_element = $("<li/>");
                            list_element.text(entries[i].name);
                            list_element.data('name', entries[i].name);
                            list_element.addClass('file');
                            list.append(list_element);
                        }
                        $file_view.append(list);
                        $file_view.on('click', 'ul > li.file', function () {
                            var $input = $(".open-file-dialog input.holder");
                            $input.data("file", $(this).data('name'));
                            $input.val($(this).data('name'));
                        });
                        $(".open-file-dialog input.holder").data("path", entry.fullPath);
                    });
                } else {
                        //$node.parent().siblings('.holder')
                    $(".open-folder-dialog input.holder")
                            .val(entry.fullPath)
                            .data('path', entry.fullPath);
                }
            });
        return tree;
    }


    function _showOpenFolderDialog(Dialogs, callback) {
        var node = $("<div>");
        node.addClass("directory_tree");
        createTree(node).bind("loaded.jstree", function (event, data) {
            Dialogs.showModalDialog(DIALOG_ID_OPEN_FOLDER, "Open Folder", node).
                then(function (id) {
                    callback(id);
                });
        });
    }

    function _showOpenFileDialog(Dialogs, callback) {
        var node = $("<div>");
        node.addClass("directory_tree");
        var container = $("<div>");
        var fileview = $("<div>");
        container.addClass("file_container");
        fileview.addClass("file_view");
        container.append(node);
        container.append(fileview);
        createTree(node, true).bind("loaded.jstree", function (event, data) {
            Dialogs.showModalDialog(DIALOG_ID_OPEN_FILE, "Open File", container).
                then(function (id) {
                    callback(id, node);
                });
        });
    }
    function add_slash(str) {
        if (str[str.length - 1] !== "/") {
            return str + "/";
        }
        return str;
    }
    function showOpenDialog(callback, allowMultipleSelection, chooseDirectory, title, initialPath, fileTypes) {
        if (!brackets) {
            return;
        }
        var Dialogs  = brackets.getModule("widgets/Dialogs");
        var handler = chooseDirectory ? _showOpenFolderDialog : _showOpenFileDialog;
        handler(Dialogs, function (id) {
            var paths = [],
                $input;
            if (id === Dialogs.DIALOG_BTN_OK) {
                if (chooseDirectory) {
                    $input = $(".open-folder-dialog input.holder");
                    paths.push($input.data('path'));
                } else {

                    $input = $(".open-file-dialog input.holder");
                    if (!$input.data('file')) {
                        return;
                    }
                    paths.push(add_slash($input.data('path')) + $input.data('file'));
                }
            }
            callback(0, paths);
        });
    }

    /**
     * Add html content
     */
    AppInit.htmlReady(function () {
        /*
         * Load style sheet
         */
        var $link = $("<link/>");
        $link.attr({
            type:       "text/css",
            rel:        "stylesheet",
            href:       "../../shell/styles/opendlg.css"
        });
        $("head").append($link[0]);
        $("body").append(Mustache.render(OpenDlgView, templateVars));

    });
    exports.showOpenDialog = showOpenDialog;

});