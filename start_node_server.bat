@echo off
cd 
:begin
echo Start a Node Server
echo 1-) Websocket server
echo 2-) HTTP server
set /P servertype=Select the sever type^>
IF  %servertype%==1 (
	node shell\servers\nodeJS\ws
	goto final
)
IF  %servertype%==2 (
	node shell\servers\nodeJS\http
	goto final
)
cls
goto begin
:final
