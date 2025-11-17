#!/bin/bash
# Startup script for Gerekçeli Karar Programı

echo "Gerekçeli Karar Programı başlatılıyor..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "HATA: Python 3 bulunamadı. Lütfen Python 3.7 veya üzerini yükleyin."
    exit 1
fi

echo "Python versiyonu: $(python3 --version)"
echo ""

# Check if requirements are installed
echo "Bağımlılıklar kontrol ediliyor..."
if ! python3 -c "import tkinter" 2>/dev/null; then
    echo "UYARI: tkinter bulunamadı. Lütfen python3-tk paketini yükleyin."
fi

# Try to run the application
echo "Uygulama başlatılıyor..."
echo ""
python3 gerekce_editor.py
