#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Speech Recognition Module
Handles speech-to-text conversion and voice commands
"""

import speech_recognition as sr
import threading
import queue


class SpeechRecognitionManager:
    """Manages speech recognition operations"""
    
    # Voice commands in Turkish
    COMMANDS = {
        'nokta koy': 'period',
        'virgül koy': 'comma',
        'paragraf ekle': 'paragraph',
        'yeni satır': 'newline',
        'dur': 'stop',
    }
    
    def __init__(self):
        """Initialize the speech recognition manager"""
        self.recognizer = sr.Recognizer()
        self.microphone = None
        self.is_listening = False
        self.listen_thread = None
        self.text_callback = None
        self.command_callback = None
        
    def start_listening(self, text_callback, command_callback):
        """
        Start listening for speech input
        
        Args:
            text_callback (callable): Callback function for recognized text
            command_callback (callable): Callback function for recognized commands
            
        Returns:
            bool: True if started successfully, False otherwise
        """
        if self.is_listening:
            return False
            
        try:
            self.microphone = sr.Microphone()
            self.text_callback = text_callback
            self.command_callback = command_callback
            self.is_listening = True
            
            # Adjust for ambient noise
            with self.microphone as source:
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
            
            # Start listening thread
            self.listen_thread = threading.Thread(target=self._listen_loop)
            self.listen_thread.daemon = True
            self.listen_thread.start()
            
            return True
            
        except Exception as e:
            print(f"Error starting speech recognition: {e}")
            self.is_listening = False
            return False
    
    def stop_listening(self):
        """Stop listening for speech input"""
        self.is_listening = False
        if self.listen_thread:
            self.listen_thread.join(timeout=2)
    
    def _listen_loop(self):
        """Main listening loop (runs in separate thread)"""
        while self.is_listening:
            try:
                with self.microphone as source:
                    # Listen for audio input
                    audio = self.recognizer.listen(source, timeout=5, phrase_time_limit=10)
                    
                    try:
                        # Recognize speech using Google Speech Recognition
                        # First try Turkish
                        text = self.recognizer.recognize_google(audio, language='tr-TR')
                        
                        # Check if it's a command
                        if self._is_command(text):
                            if self.command_callback:
                                self.command_callback(text.lower())
                        else:
                            # Regular text
                            if self.text_callback:
                                self.text_callback(text)
                                
                    except sr.UnknownValueError:
                        # Could not understand audio
                        pass
                    except sr.RequestError as e:
                        print(f"Could not request results; {e}")
                        
            except sr.WaitTimeoutError:
                # Timeout waiting for phrase to start
                continue
            except Exception as e:
                print(f"Error in listen loop: {e}")
                if not self.is_listening:
                    break
    
    def _is_command(self, text):
        """
        Check if recognized text is a voice command
        
        Args:
            text (str): Recognized text
            
        Returns:
            bool: True if text is a command
        """
        text_lower = text.lower()
        for command in self.COMMANDS.keys():
            if command in text_lower:
                return True
        return False
    
    def recognize_from_file(self, audio_file_path):
        """
        Recognize speech from an audio file
        
        Args:
            audio_file_path (str): Path to audio file
            
        Returns:
            str: Recognized text
        """
        try:
            with sr.AudioFile(audio_file_path) as source:
                audio = self.recognizer.record(source)
                text = self.recognizer.recognize_google(audio, language='tr-TR')
                return text
        except Exception as e:
            raise Exception(f"Error recognizing from file: {str(e)}")
