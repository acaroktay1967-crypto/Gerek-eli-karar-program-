#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gerekçeli Karar Programı
A program for writing, editing, translating, and exporting justified decisions.
"""

import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox, filedialog, font
from tkinter.colorchooser import askcolor
import threading
import os

# Import modules
from modules.translator import TranslationManager
from modules.speech_to_text import SpeechRecognitionManager
from modules.export_manager import ExportManager


class GerekceliKararApp:
    """Main application class for Gerekçeli Karar Program"""
    
    def __init__(self, root):
        self.root = root
        self.root.title("Gerekçeli Karar Programı")
        self.root.geometry("1200x800")
        
        # Initialize managers
        self.translation_manager = TranslationManager()
        self.speech_manager = SpeechRecognitionManager()
        self.export_manager = ExportManager()
        
        # Text formatting state
        self.current_font_size = 12
        self.current_font_family = "Arial"
        self.current_text_color = "black"
        
        # Create UI
        self.create_menu_bar()
        self.create_toolbar()
        self.create_main_content()
        self.create_status_bar()
        
    def create_menu_bar(self):
        """Create the menu bar"""
        menubar = tk.Menu(self.root)
        self.root.config(menu=menubar)
        
        # File menu
        file_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Dosya", menu=file_menu)
        file_menu.add_command(label="Yeni", command=self.new_document)
        file_menu.add_command(label="Aç", command=self.open_document)
        file_menu.add_command(label="Kaydet", command=self.save_document)
        file_menu.add_separator()
        file_menu.add_command(label="PDF Olarak Kaydet", command=self.export_pdf)
        file_menu.add_command(label="DOCX Olarak Kaydet", command=self.export_docx)
        file_menu.add_separator()
        file_menu.add_command(label="Çıkış", command=self.root.quit)
        
        # Edit menu
        edit_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Düzenle", menu=edit_menu)
        edit_menu.add_command(label="Geri Al", command=self.undo)
        edit_menu.add_command(label="Yinele", command=self.redo)
        edit_menu.add_separator()
        edit_menu.add_command(label="Kes", command=self.cut)
        edit_menu.add_command(label="Kopyala", command=self.copy)
        edit_menu.add_command(label="Yapıştır", command=self.paste)
        
        # Translation menu
        translate_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Çeviri", menu=translate_menu)
        translate_menu.add_command(label="İngilizce'ye Çevir", 
                                  command=lambda: self.translate_text('en'))
        translate_menu.add_command(label="Fransızca'ya Çevir", 
                                  command=lambda: self.translate_text('fr'))
        translate_menu.add_command(label="Almanca'ya Çevir", 
                                  command=lambda: self.translate_text('de'))
        translate_menu.add_command(label="İspanyolca'ya Çevir", 
                                  command=lambda: self.translate_text('es'))
        
        # Tools menu
        tools_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Araçlar", menu=tools_menu)
        tools_menu.add_command(label="Sesli Dikte Başlat", command=self.start_dictation)
        tools_menu.add_command(label="Sesli Dikte Durdur", command=self.stop_dictation)
        
        # Help menu
        help_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Yardım", menu=help_menu)
        help_menu.add_command(label="Hakkında", command=self.show_about)
        
    def create_toolbar(self):
        """Create the formatting toolbar"""
        toolbar = tk.Frame(self.root, bd=1, relief=tk.RAISED)
        toolbar.pack(side=tk.TOP, fill=tk.X)
        
        # Font size
        tk.Label(toolbar, text="Boyut:").pack(side=tk.LEFT, padx=5)
        self.font_size_var = tk.StringVar(value="12")
        font_size_combo = ttk.Combobox(toolbar, textvariable=self.font_size_var, 
                                       values=[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32],
                                       width=5)
        font_size_combo.pack(side=tk.LEFT, padx=2)
        font_size_combo.bind('<<ComboboxSelected>>', self.change_font_size)
        
        # Font family
        tk.Label(toolbar, text="Yazı Tipi:").pack(side=tk.LEFT, padx=5)
        self.font_family_var = tk.StringVar(value="Arial")
        font_family_combo = ttk.Combobox(toolbar, textvariable=self.font_family_var,
                                        values=["Arial", "Times New Roman", "Courier New", 
                                               "Verdana", "Calibri"],
                                        width=15)
        font_family_combo.pack(side=tk.LEFT, padx=2)
        font_family_combo.bind('<<ComboboxSelected>>', self.change_font_family)
        
        # Separator
        ttk.Separator(toolbar, orient=tk.VERTICAL).pack(side=tk.LEFT, padx=5, fill=tk.Y)
        
        # Bold button
        self.bold_btn = tk.Button(toolbar, text="B", font=("Arial", 10, "bold"),
                                 width=3, command=self.toggle_bold)
        self.bold_btn.pack(side=tk.LEFT, padx=2)
        
        # Italic button
        self.italic_btn = tk.Button(toolbar, text="I", font=("Arial", 10, "italic"),
                                   width=3, command=self.toggle_italic)
        self.italic_btn.pack(side=tk.LEFT, padx=2)
        
        # Underline button
        self.underline_btn = tk.Button(toolbar, text="U", font=("Arial", 10, "underline"),
                                      width=3, command=self.toggle_underline)
        self.underline_btn.pack(side=tk.LEFT, padx=2)
        
        # Separator
        ttk.Separator(toolbar, orient=tk.VERTICAL).pack(side=tk.LEFT, padx=5, fill=tk.Y)
        
        # Color button
        self.color_btn = tk.Button(toolbar, text="Renk", width=6, 
                                  command=self.change_text_color)
        self.color_btn.pack(side=tk.LEFT, padx=2)
        
        # Separator
        ttk.Separator(toolbar, orient=tk.VERTICAL).pack(side=tk.LEFT, padx=5, fill=tk.Y)
        
        # Dictation button
        self.dictation_btn = tk.Button(toolbar, text="🎤 Dikte", width=8,
                                      command=self.toggle_dictation)
        self.dictation_btn.pack(side=tk.LEFT, padx=2)
        
    def create_main_content(self):
        """Create the main content area with text editor"""
        # Create notebook for tabs
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Original text tab
        self.original_frame = tk.Frame(self.notebook)
        self.notebook.add(self.original_frame, text="Orijinal Metin")
        
        self.text_editor = scrolledtext.ScrolledText(
            self.original_frame,
            wrap=tk.WORD,
            font=(self.current_font_family, self.current_font_size),
            undo=True
        )
        self.text_editor.pack(fill=tk.BOTH, expand=True)
        
        # Translation tab
        self.translation_frame = tk.Frame(self.notebook)
        self.notebook.add(self.translation_frame, text="Çeviri")
        
        self.translation_editor = scrolledtext.ScrolledText(
            self.translation_frame,
            wrap=tk.WORD,
            font=(self.current_font_family, self.current_font_size),
            undo=True
        )
        self.translation_editor.pack(fill=tk.BOTH, expand=True)
        
    def create_status_bar(self):
        """Create the status bar"""
        self.status_bar = tk.Label(self.root, text="Hazır", bd=1, relief=tk.SUNKEN, anchor=tk.W)
        self.status_bar.pack(side=tk.BOTTOM, fill=tk.X)
        
    # File operations
    def new_document(self):
        """Create a new document"""
        if messagebox.askyesno("Yeni Belge", "Mevcut belgeyi temizlemek istediğinizden emin misiniz?"):
            self.text_editor.delete(1.0, tk.END)
            self.translation_editor.delete(1.0, tk.END)
            self.update_status("Yeni belge oluşturuldu")
            
    def open_document(self):
        """Open a document"""
        file_path = filedialog.askopenfilename(
            filetypes=[("Text files", "*.txt"), ("All files", "*.*")]
        )
        if file_path:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    self.text_editor.delete(1.0, tk.END)
                    self.text_editor.insert(1.0, content)
                self.update_status(f"Dosya açıldı: {file_path}")
            except Exception as e:
                messagebox.showerror("Hata", f"Dosya açılamadı: {str(e)}")
                
    def save_document(self):
        """Save the document"""
        file_path = filedialog.asksaveasfilename(
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt"), ("All files", "*.*")]
        )
        if file_path:
            try:
                content = self.text_editor.get(1.0, tk.END)
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                self.update_status(f"Dosya kaydedildi: {file_path}")
            except Exception as e:
                messagebox.showerror("Hata", f"Dosya kaydedilemedi: {str(e)}")
    
    # Edit operations
    def undo(self):
        """Undo last action"""
        try:
            self.text_editor.edit_undo()
        except tk.TclError:
            pass
            
    def redo(self):
        """Redo last action"""
        try:
            self.text_editor.edit_redo()
        except tk.TclError:
            pass
            
    def cut(self):
        """Cut selected text"""
        try:
            self.text_editor.event_generate("<<Cut>>")
        except tk.TclError:
            pass
            
    def copy(self):
        """Copy selected text"""
        try:
            self.text_editor.event_generate("<<Copy>>")
        except tk.TclError:
            pass
            
    def paste(self):
        """Paste text"""
        try:
            self.text_editor.event_generate("<<Paste>>")
        except tk.TclError:
            pass
    
    # Formatting operations
    def change_font_size(self, event=None):
        """Change font size"""
        try:
            size = int(self.font_size_var.get())
            self.current_font_size = size
            self.text_editor.config(font=(self.current_font_family, size))
            self.translation_editor.config(font=(self.current_font_family, size))
        except ValueError:
            pass
            
    def change_font_family(self, event=None):
        """Change font family"""
        family = self.font_family_var.get()
        self.current_font_family = family
        self.text_editor.config(font=(family, self.current_font_size))
        self.translation_editor.config(font=(family, self.current_font_size))
        
    def toggle_bold(self):
        """Toggle bold formatting"""
        try:
            current_tags = self.text_editor.tag_names("sel.first")
            if "bold" in current_tags:
                self.text_editor.tag_remove("bold", "sel.first", "sel.last")
            else:
                self.text_editor.tag_add("bold", "sel.first", "sel.last")
                bold_font = font.Font(self.text_editor, self.text_editor.cget("font"))
                bold_font.configure(weight="bold")
                self.text_editor.tag_config("bold", font=bold_font)
        except tk.TclError:
            messagebox.showwarning("Uyarı", "Lütfen metni seçin")
            
    def toggle_italic(self):
        """Toggle italic formatting"""
        try:
            current_tags = self.text_editor.tag_names("sel.first")
            if "italic" in current_tags:
                self.text_editor.tag_remove("italic", "sel.first", "sel.last")
            else:
                self.text_editor.tag_add("italic", "sel.first", "sel.last")
                italic_font = font.Font(self.text_editor, self.text_editor.cget("font"))
                italic_font.configure(slant="italic")
                self.text_editor.tag_config("italic", font=italic_font)
        except tk.TclError:
            messagebox.showwarning("Uyarı", "Lütfen metni seçin")
            
    def toggle_underline(self):
        """Toggle underline formatting"""
        try:
            current_tags = self.text_editor.tag_names("sel.first")
            if "underline" in current_tags:
                self.text_editor.tag_remove("underline", "sel.first", "sel.last")
            else:
                self.text_editor.tag_add("underline", "sel.first", "sel.last")
                underline_font = font.Font(self.text_editor, self.text_editor.cget("font"))
                underline_font.configure(underline=True)
                self.text_editor.tag_config("underline", font=underline_font)
        except tk.TclError:
            messagebox.showwarning("Uyarı", "Lütfen metni seçin")
            
    def change_text_color(self):
        """Change text color"""
        color = askcolor(title="Renk Seçin")
        if color[1]:
            try:
                self.text_editor.tag_add("color", "sel.first", "sel.last")
                self.text_editor.tag_config("color", foreground=color[1])
            except tk.TclError:
                messagebox.showwarning("Uyarı", "Lütfen metni seçin")
    
    # Translation operations
    def translate_text(self, target_lang):
        """Translate text to target language"""
        text = self.text_editor.get(1.0, tk.END).strip()
        if not text:
            messagebox.showwarning("Uyarı", "Çevrilecek metin bulunamadı")
            return
            
        self.update_status(f"Çeviri yapılıyor...")
        
        def do_translation():
            try:
                translated = self.translation_manager.translate(text, target_lang)
                self.translation_editor.delete(1.0, tk.END)
                self.translation_editor.insert(1.0, translated)
                self.notebook.select(1)  # Switch to translation tab
                self.update_status(f"Çeviri tamamlandı")
            except Exception as e:
                messagebox.showerror("Hata", f"Çeviri yapılamadı: {str(e)}")
                self.update_status("Çeviri başarısız")
        
        # Run translation in background thread
        thread = threading.Thread(target=do_translation)
        thread.daemon = True
        thread.start()
    
    # Speech recognition operations
    def toggle_dictation(self):
        """Toggle dictation on/off"""
        if self.speech_manager.is_listening:
            self.stop_dictation()
        else:
            self.start_dictation()
            
    def start_dictation(self):
        """Start speech recognition"""
        self.update_status("Sesli dikte başlatılıyor...")
        
        def on_text_recognized(text):
            """Callback when text is recognized"""
            self.text_editor.insert(tk.INSERT, text + " ")
            
        def on_command_recognized(command):
            """Callback when command is recognized"""
            if command == "nokta koy":
                self.text_editor.insert(tk.INSERT, ". ")
            elif command == "paragraf ekle":
                self.text_editor.insert(tk.INSERT, "\n\n")
            elif command == "virgül koy":
                self.text_editor.insert(tk.INSERT, ", ")
            elif command == "yeni satır":
                self.text_editor.insert(tk.INSERT, "\n")
        success = self.speech_manager.start_listening(on_text_recognized, on_command_recognized)
        if success:
            self.dictation_btn.config(relief=tk.SUNKEN, bg="red")
            self.update_status("Sesli dikte aktif")
        else:
            messagebox.showerror("Hata", "Sesli dikte başlatılamadı")
            self.update_status("Sesli dikte başarısız")
            
    def stop_dictation(self):
        """Stop speech recognition"""
        self.speech_manager.stop_listening()
        self.dictation_btn.config(relief=tk.RAISED, bg="SystemButtonFace")
        self.update_status("Sesli dikte durduruldu")
    
    # Export operations
    def export_pdf(self):
        """Export document as PDF"""
        file_path = filedialog.asksaveasfilename(
            defaultextension=".pdf",
            filetypes=[("PDF files", "*.pdf")]
        )
        if file_path:
            try:
                text = self.text_editor.get(1.0, tk.END)
                self.export_manager.export_to_pdf(text, file_path)
                self.update_status(f"PDF kaydedildi: {file_path}")
                messagebox.showinfo("Başarılı", "PDF dosyası oluşturuldu")
            except Exception as e:
                messagebox.showerror("Hata", f"PDF oluşturulamadı: {str(e)}")
                
    def export_docx(self):
        """Export document as DOCX"""
        file_path = filedialog.asksaveasfilename(
            defaultextension=".docx",
            filetypes=[("Word files", "*.docx")]
        )
        if file_path:
            try:
                text = self.text_editor.get(1.0, tk.END)
                self.export_manager.export_to_docx(text, file_path)
                self.update_status(f"DOCX kaydedildi: {file_path}")
                messagebox.showinfo("Başarılı", "DOCX dosyası oluşturuldu")
            except Exception as e:
                messagebox.showerror("Hata", f"DOCX oluşturulamadı: {str(e)}")
    
    # Utility methods
    def update_status(self, message):
        """Update status bar message"""
        self.status_bar.config(text=message)
        
    def show_about(self):
        """Show about dialog"""
        messagebox.showinfo(
            "Hakkında",
            "Gerekçeli Karar Programı\n\n"
            "Version 1.0\n\n"
            "Gerekçeli kararları düzenlemek, çevirmek ve çıktı almak için geliştirilmiştir."
        )


def main():
    """Main entry point"""
    root = tk.Tk()
    app = GerekceliKararApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
