@echo off
where bash >nul 2>nul || (echo Bash is required to run the research-agents hook. 1>&2 & exit /b 1)
bash "%~dp0%1"
