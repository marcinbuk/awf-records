' AWF Records - Zatrzymaj wszystko
' Kliknij 2x aby zatrzymac serwer i tunel

Set WshShell = CreateObject("WScript.Shell")
WshShell.Run Chr(34) & Replace(WScript.ScriptFullName, "stop.vbs", "stop.bat") & Chr(34), 0, False
