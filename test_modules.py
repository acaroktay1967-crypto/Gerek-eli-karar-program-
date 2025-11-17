#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script for Gerekçeli Karar Programı modules
"""

import sys
import os

# Add modules to path
sys.path.insert(0, os.path.dirname(__file__))

from modules.translator import TranslationManager
from modules.export_manager import ExportManager


def test_translation_manager():
    """Test the translation manager"""
    print("Testing TranslationManager...")
    try:
        translator = TranslationManager()
        
        # Test basic translation
        text = "Merhaba dünya"
        result = translator.translate(text, target_lang='en', source_lang='tr')
        print(f"Translation test: '{text}' -> '{result}'")
        
        # Test supported languages
        languages = translator.get_supported_languages()
        print(f"Supported languages: {len(languages)} languages")
        
        print("✓ TranslationManager tests passed\n")
        return True
    except Exception as e:
        print(f"✗ TranslationManager tests failed: {e}\n")
        return False


def test_export_manager():
    """Test the export manager"""
    print("Testing ExportManager...")
    try:
        export_manager = ExportManager()
        
        # Create temp directory for test files
        import tempfile
        temp_dir = tempfile.mkdtemp()
        
        test_text = "Bu bir test metnidir.\n\nİkinci paragraf."
        
        # Test PDF export
        pdf_path = os.path.join(temp_dir, "test.pdf")
        export_manager.export_to_pdf(test_text, pdf_path)
        if os.path.exists(pdf_path):
            print(f"✓ PDF export successful: {pdf_path}")
        else:
            print("✗ PDF export failed")
            return False
        
        # Test DOCX export
        docx_path = os.path.join(temp_dir, "test.docx")
        export_manager.export_to_docx(test_text, docx_path)
        if os.path.exists(docx_path):
            print(f"✓ DOCX export successful: {docx_path}")
        else:
            print("✗ DOCX export failed")
            return False
        
        # Test TXT export
        txt_path = os.path.join(temp_dir, "test.txt")
        export_manager.export_to_txt(test_text, txt_path)
        if os.path.exists(txt_path):
            print(f"✓ TXT export successful: {txt_path}")
        else:
            print("✗ TXT export failed")
            return False
        
        print("✓ ExportManager tests passed\n")
        return True
        
    except Exception as e:
        print(f"✗ ExportManager tests failed: {e}\n")
        return False


def test_speech_manager():
    """Test the speech recognition manager (basic initialization only)"""
    print("Testing SpeechRecognitionManager...")
    try:
        from modules.speech_to_text import SpeechRecognitionManager
        
        speech_manager = SpeechRecognitionManager()
        print("✓ SpeechRecognitionManager initialized")
        
        # Test command detection
        is_cmd = speech_manager._is_command("nokta koy")
        if is_cmd:
            print("✓ Command detection works")
        else:
            print("✗ Command detection failed")
            return False
        
        print("✓ SpeechRecognitionManager tests passed\n")
        return True
        
    except Exception as e:
        print(f"✗ SpeechRecognitionManager tests failed: {e}\n")
        return False


def main():
    """Run all tests"""
    print("=" * 60)
    print("Running Gerekçeli Karar Programı Module Tests")
    print("=" * 60 + "\n")
    
    results = []
    
    # Test translation
    results.append(("Translation", test_translation_manager()))
    
    # Test export
    results.append(("Export", test_export_manager()))
    
    # Test speech (initialization only)
    results.append(("Speech Recognition", test_speech_manager()))
    
    # Summary
    print("=" * 60)
    print("Test Summary:")
    print("=" * 60)
    for name, passed in results:
        status = "PASSED" if passed else "FAILED"
        print(f"{name}: {status}")
    
    all_passed = all(result[1] for result in results)
    print("=" * 60)
    if all_passed:
        print("All tests PASSED ✓")
    else:
        print("Some tests FAILED ✗")
    print("=" * 60)
    
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
