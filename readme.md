# Brackets Web Shell
This is a shell replacement for Adobe-Brackets for run it a in browser.
The servers implementations for the moment are:
1-)Php HTTP server
2-)NodeJs HTTP and WebSockets

How to Run
--------------
Put the **adobe-brackets** project folder download from github [download](here.md)
In the toplevel folder of the bracket-web-shell and rename it to *adobe-brackets*
in windows click *rename_brackdir.bat*
And copy in adobe-brackets/src/thirdparty the dependecies:
    CodeMirror2
    path-utils
    jslint
    smart-auto-complete
    mustache

*You can get all the dependencies if you download a full version of bracket instaler and take from this or with a git client that parse the .gitmodules and download for you*

###For NodeJs
In windows click star_node_server.bat and select the server type
in other OS for in a terminal cd to shell folder and type *node shell\servers\nodeJS\ws* for webSockets or *node shell\servers\nodeJS\http* for http server.
If select http open in the browser http://localhost/site/node-http.html
If select ws dobleclick in node-ws.html
###For PHP 
Copy to the *`www`* in your webserver 
open in a browser http://localhost/brackets-web-shell/php-http
You have to add the corrects permission to the filesystem to work fine.

Warning
---------
**Is not secure put online this site.**

Get into the code
---------------
The appshell_extensions.js is taken from the **`adobe_brackets-shell`** project to mimic the native implementation in  javascript and server type tecnologies.
In the folder shell/server are the servers implementation.
