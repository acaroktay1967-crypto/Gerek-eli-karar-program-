#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Translation Manager Module
Handles text translation using multiple translation services
"""

from deep_translator import GoogleTranslator


class TranslationManager:
    """Manages translation operations"""
    
    # Language codes mapping
    LANGUAGES = {
        'en': 'English',
        'fr': 'French',
        'de': 'German',
        'es': 'Spanish',
        'tr': 'Turkish',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'ar': 'Arabic',
        'zh-CN': 'Chinese (Simplified)',
    }
    
    def __init__(self):
        """Initialize the translation manager"""
        self.source_lang = 'tr'  # Default source language is Turkish
        
    def translate(self, text, target_lang='en', source_lang='auto'):
        """
        Translate text to target language
        
        Args:
            text (str): Text to translate
            target_lang (str): Target language code
            source_lang (str): Source language code (default: 'auto')
            
        Returns:
            str: Translated text
        """
        if not text or not text.strip():
            return ""
            
        try:
            translator = GoogleTranslator(source=source_lang, target=target_lang)
            
            # Split text into chunks if it's too long (Google Translate has limits)
            max_length = 4500
            if len(text) <= max_length:
                return translator.translate(text)
            else:
                # Split by paragraphs and translate in chunks
                paragraphs = text.split('\n')
                translated_paragraphs = []
                current_chunk = ""
                
                for para in paragraphs:
                    if len(current_chunk) + len(para) < max_length:
                        current_chunk += para + "\n"
                    else:
                        if current_chunk:
                            translated_paragraphs.append(translator.translate(current_chunk))
                        current_chunk = para + "\n"
                
                if current_chunk:
                    translated_paragraphs.append(translator.translate(current_chunk))
                
                return "\n".join(translated_paragraphs)
                
        except Exception as e:
            raise Exception(f"Translation error: {str(e)}")
    
    def get_supported_languages(self):
        """
        Get list of supported languages
        
        Returns:
            dict: Dictionary of language codes and names
        """
        return self.LANGUAGES
    
    def detect_language(self, text):
        """
        Detect the language of given text
        
        Args:
            text (str): Text to analyze
            
        Returns:
            str: Detected language code
        """
        try:
            from deep_translator import single_detection
            lang = single_detection(text, api_key=None)
            return lang
        except Exception:
            return 'auto'
