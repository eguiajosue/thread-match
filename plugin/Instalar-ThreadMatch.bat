@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Install.ps1"
if errorlevel 1 echo No se completo la instalacion. Revisa el mensaje anterior.
pause
