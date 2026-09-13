@echo off
setlocal
echo ========================================
echo   VIGO/QUALCOMM ROOT PASSWORD CALCULATOR
echo ========================================
echo.

set /p "PDSN=Enter PSDN: "
set /p "RADIO_SN=Enter persist.radio.sn: "

:: Передаём переменные в окружение для PowerShell
set PDSN=%PDSN%
set RADIO_SN=%RADIO_SN%

powershell -NoProfile -Command ^
    "$p = $env:PDSN;" ^
    "$sn = $env:RADIO_SN;" ^
    "$s = 'E13S31NMP5DfCs24';" ^
    "$mix = ''; $max = [Math]::Max($p.Length, $s.Length);" ^
    "for($i=0; $i -lt $max; $i++) { if($i -lt $p.Length){$mix+=$p[$i]} if($i -lt $s.Length){$mix+=$s[$i]} }" ^
    "$sha = [System.Security.Cryptography.SHA256]::Create();" ^
    "$h1 = [System.BitConverter]::ToString($sha.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($mix))).Replace('-','').ToLower();" ^
    "$h2 = [System.BitConverter]::ToString($sha.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($h1))).Replace('-','').ToLower();" ^
    "$factoryPass = 'DfCs' + $h2.Substring(0,8) + '#!';" ^
    "$last4 = $sn.Substring($sn.Length - 4);" ^
    "$rawSU = 'DfCs' + $last4 + '#!';" ^
    "Write-Host '----------------------------------------' -ForegroundColor Cyan;" ^
    "Write-Host 'PASS 1: Factory (from PSDN)' -ForegroundColor Green;" ^
    "Write-Host ('>>> ' + $factoryPass) -ForegroundColor White;" ^
    "Write-Host '';" ^
    "Write-Host 'PASS 2: SU (from persist.radio.sn last 4)' -ForegroundColor Magenta;" ^
    "Write-Host ('Raw string: ' + $rawSU) -ForegroundColor White;" ^
    "Write-Host '';" ^
    "Write-Host 'PASS 3: Master (backup)' -ForegroundColor Yellow;" ^
    "Write-Host '>>> DfCs0715#!' -ForegroundColor White;" ^
    "Write-Host '----------------------------------------' -ForegroundColor Cyan;"

pause
