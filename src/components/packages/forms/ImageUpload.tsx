'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (file: File) => void;
  preview?: string | File;
  label?: string;
}

export const ImageUpload = ({ onUpload, preview, label = "Upload Image" }: ImageUploadProps) => {
  const [dragOver, setDragOver] = useState(false);
  
  const previewUrl = typeof preview === 'string' ? preview : 
                     preview instanceof File ? URL.createObjectURL(preview) : '';

  return (
    <div 
      className={`relative border-2 border-dashed border-white/30 rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer group backdrop-blur-sm ${
        dragOver ? 'border-blue-400/50 bg-blue-50/20' : 'hover:border-white/50 hover:bg-white/10'
      }`}
      style={{
        background: dragOver 
          ? 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.05) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        boxShadow: dragOver 
          ? '0 8px 32px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          : '0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.1)'
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
          onUpload(file);
        }
      }}
    >
      {previewUrl ? (
        <div className="relative">
          <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto rounded-xl shadow-md" />
          <button 
            onClick={(e) => {
              e.stopPropagation();
              // Handle remove logic here if needed
            }}
            className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className={`inline-flex p-3 rounded-xl transition-colors backdrop-blur-sm ${
            dragOver ? 'bg-blue-100/30' : 'bg-white/20 group-hover:bg-blue-50/30'
          }`}
          style={{
            boxShadow: '0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
            <Upload className={`w-6 h-6 transition-colors ${
              dragOver ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-500'
            }`} />
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1 text-sm">{label}</p>
            <p className="text-xs text-gray-500">Drag & drop or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
          </div>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  );
};
