@echo off
REM vexp-hint: event-driven orientation hint (UserPromptSubmit). Fails open.
set "VEXP_BIN=C:\Users\bofer\AppData\Roaming\npm\node_modules\vexp-cli\node_modules\@vexp\core-win32-x64\bin\vexp-core.exe"
if not exist "%VEXP_BIN%" exit /b 0
set "VEXP_HOOK_AGENT=codex"
"%VEXP_BIN%" prompt-hint 2>nul
exit /b 0
