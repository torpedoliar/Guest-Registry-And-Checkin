@echo off
REM Wrapper to start dev servers (calls start-dev.bat)
SETLOCAL
set "ROOT=%~dp0"
call "%ROOT%start-dev.bat"
ENDLOCAL
