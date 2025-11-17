@echo off
REM Startup script for Gerekçeli Karar Programı (Windows)

echo Gerekçeli Karar Programi baslatiliyor...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo HATA: Python bulunamadi. Lutfen Python 3.7 veya uzerini yukleyin.
    pause
    exit /b 1
)

echo Python versiyonu:
python --version
echo.

REM Try to run the application
echo Uygulama baslatiliyor...
echo.
python gerekce_editor.py

pause
