'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
    <Card 
      className={`relative border-2 border-dashed border-gray-300 rounded-lg transition-all duration-300 cursor-pointer ${
        dragOver ? 'border-blue-400 bg-blue-50' : 'hover:border-blue-300 hover:bg-blue-50/30'
      }`}
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
      <CardContent className="p-6 text-center">
        {previewUrl ? (
          <div className="relative">
            <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto rounded-md shadow-md" />
            <Button 
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full p-0"
              onClick={(e) => {
                e.stopPropagation();
                // Handle remove logic here if needed
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`inline-flex p-4 rounded-lg transition-colors ${
              dragOver ? 'bg-blue-100' : 'bg-gray-50'
            }`}>
              <Upload className={`w-8 h-8 transition-colors ${
                dragOver ? 'text-blue-600' : 'text-gray-500'
              }`} />
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-2">{label}</p>
              <p className="text-sm text-gray-500">Drag & drop or click to browse</p>
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
      </CardContent>
    </Card>
  );
};
