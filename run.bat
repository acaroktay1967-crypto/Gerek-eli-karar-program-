@echo off
REM Launcher script for Gerekçeli Karar Programı (Windows)

echo Gerekçeli Karar Programı - Baslatiliyor...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo HATA: Python kurulu degil!
    echo Lutfen Python 3.7 veya uzerini yukleyin.
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv" (
    echo Sanal ortam bulunamadi. Olusturuluyor...
    python -m venv venv
    echo Sanal ortam olusturuldu.
)

REM Activate virtual environment
echo Sanal ortam etkinlestiriliyor...
call venv\Scripts\activate.bat

REM Install/update dependencies
echo Bagimlilliklar kontrol ediliyor...
pip install -q -r requirements.txt

REM Run the application
echo Uygulama baslatiliyor...
python main.py

REM Deactivate virtual environment
call venv\Scripts\deactivate.bat

pause
