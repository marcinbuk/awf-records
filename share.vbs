' AWF Records - Kliknij 2x aby udostepnic aplikacje
' Po ~15s pojawi sie okno z linkiem do udostepnienia
' Aby zatrzymac - kliknij 2x stop.vbs

Set WshShell = CreateObject("WScript.Shell")
scriptDir = Replace(WScript.ScriptFullName, WScript.ScriptName, "")
WshShell.Run "powershell -ExecutionPolicy Bypass -File """ & scriptDir & "share.ps1""", 1, False
