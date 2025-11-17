#!/bin/bash
# Launcher script for Gerekçeli Karar Programı

echo "Gerekçeli Karar Programı - Başlatılıyor..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "HATA: Python 3 kurulu değil!"
    echo "Lütfen Python 3.7 veya üzerini yükleyin."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Sanal ortam bulunamadı. Oluşturuluyor..."
    python3 -m venv venv
    echo "Sanal ortam oluşturuldu."
fi

# Activate virtual environment
echo "Sanal ortam etkinleştiriliyor..."
source venv/bin/activate

# Install/update dependencies
echo "Bağımlılıklar kontrol ediliyor..."
pip install -q -r requirements.txt

# Run the application
echo "Uygulama başlatılıyor..."
python3 main.py

# Deactivate virtual environment
deactivate
