# Compression Guidelines

## Overview

This document outlines all file size limits, compression settings, and optimization requirements for the Jotatsu LMS platform. Following these guidelines ensures optimal performance, fast loading times, and good user experience.

## Image Compression Settings

### **Chat Images**
- **Maximum Size**: 150KB (compressed)
- **Original Limit**: 10MB (before compression)
- **Resolution**: 1920x1920 pixels maximum
- **Format**: JPEG (converted from other formats)
- **Quality Settings**:
  - Initial: 0.8 (80%)
  - Aggressive: 0.6 (60%)
  - Extreme: 0.4 (40%)

### **Blog Images**
- **Target Size**: 130KB (SEO optimized)
- **Original Limit**: 10MB (before compression)
- **Resolution**: 1600x1600 pixels maximum
- **Format**: JPEG
- **Quality Settings**:
  - Initial: 0.7 (70%)
  - Aggressive: 0.5 (50%)
  - Extreme: 0.3 (30%)

### **Profile Pictures**
- **Maximum Size**: 150KB
- **Original Limit**: 10MB
- **Resolution**: 1920x1920 pixels maximum
- **Format**: JPEG
- **Allowed Types**: JPEG, PNG, WebP, GIF, SVG

### **Course Content Images**
- **Target Size**: 130KB (SEO optimized)
- **Original Limit**: 10MB
- **Resolution**: 1600x1600 pixels maximum
- **Format**: JPEG
- **Quality**: Adaptive based on original file size

## File Upload Limits

### **General File Limits**
- **Maximum Size**: 10MB per file
- **Storage**: Amazon S3
- **CDN**: Amazon CloudFront

### **Chat Attachments**
- **Maximum Size**: 10MB per file
- **Allowed Types**:
  - **Images**: JPEG, JPG, PNG, WebP, GIF, SVG
  - **Documents**: PDF, DOC, DOCX, TXT, RTF
  - **Audio**: MP3, WAV, M4A, OGG
  - **Spreadsheets**: XLS, XLSX, CSV


