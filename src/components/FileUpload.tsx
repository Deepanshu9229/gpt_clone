"use client"

import { useState } from 'react'
import { Widget as UploadcareWidget } from "@uploadcare/react-widget";
import { Button } from './ui/button'
import { Paperclip, X, FileText, Image, File, AlertCircle } from 'lucide-react'
import { cn } from '../lib/utils'

// Fix the Widget type issue
const Widget = UploadcareWidget as any;

interface AttachedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  extractedText?: string
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed'
  errorMessage?: string
}

interface FileUploadProps {
  attachedFiles: AttachedFile[]
  onFileAttach: (file: AttachedFile) => void
  onFileRemove: (fileId: string) => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_TYPES = [
  'image/',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/'
];

export function FileUpload({ attachedFiles, onFileAttach, onFileRemove }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})

  const validateFile = (file: any) => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
    }

    const isSupported = SUPPORTED_TYPES.some(type => 
      file.mimeType.startsWith(type)
    );
    
    if (!isSupported) {
      throw new Error('File type not supported. Please upload images, PDFs, Word docs, or text files.');
    }

    return true;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />
    if (fileType.includes('pdf')) return <FileText className="h-4 w-4" />
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  };

  const getFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  };

  return (
    <div className="relative">
      <Widget
        publicKey={process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY as string}
        id="file-uploader"
        multiple={true}
        tabs="file url"
        previewStep={true}
        onChange={async (fileInfo: any) => {
          if (fileInfo) {
            try {
              // Validate file before processing
              validateFile(fileInfo);
              
              setIsUploading(true);
              setUploadProgress(prev => ({ ...prev, [fileInfo.uuid]: 0 }));
              
              // Simulate upload progress
              const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                  const current = prev[fileInfo.uuid] || 0;
                  if (current >= 90) {
                    clearInterval(progressInterval);
                    return prev;
                  }
                  return { ...prev, [fileInfo.uuid]: current + 10 };
                });
              }, 100);

              const response = await fetch('/api/files/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  fileUrl: fileInfo.cdnUrl,
                  fileName: fileInfo.name,
                  fileType: fileInfo.mimeType,
                  fileSize: fileInfo.size,
                }),
              });
              
              const result = await response.json();
              
              if (result.success) {
                setUploadProgress(prev => ({ ...prev, [fileInfo.uuid]: 100 }));
                
                onFileAttach({
                  id: result.fileId,
                  name: fileInfo.name,
                  size: fileInfo.size,
                  type: fileInfo.mimeType,
                  url: fileInfo.cdnUrl,
                  extractedText: result.extractedText,
                  processingStatus: result.processingStatus,
                });
              } else {
                throw new Error(result.error || 'File processing failed');
              }
            } catch (error: any) {
              console.error('File processing failed:', error);
              // Show error in UI
              onFileAttach({
                id: fileInfo.uuid,
                name: fileInfo.name,
                size: fileInfo.size,
                type: fileInfo.mimeType,
                url: fileInfo.cdnUrl,
                processingStatus: 'failed',
                errorMessage: error.message,
              });
            } finally {
              setIsUploading(false);
              setUploadProgress(prev => {
                const { [fileInfo.uuid]: _, ...rest } = prev;
                return rest;
              });
            }
          }
        }}
      >
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-foreground" 
          disabled={isUploading}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
      </Widget>

      {/* File List with Enhanced UI */}
      {attachedFiles.length > 0 && (
        <div className="mt-3 space-y-2">
          {attachedFiles.map((file) => (
            <div key={file.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
              {getFileIcon(file.type)}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{file.name}</div>
                <div className="text-xs text-muted-foreground">
                  {getFileSize(file.size)} • {file.type}
                </div>
                {file.processingStatus === 'processing' && (
                  <div className="text-xs text-blue-600">Processing...</div>
                )}
                {file.processingStatus === 'failed' && (
                  <div className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {file.errorMessage || 'Processing failed'}
                  </div>
                )}
                {file.processingStatus === 'completed' && file.extractedText && (
                  <div className="text-xs text-green-600">✓ Text extracted</div>
                )}
              </div>
              
              {/* Progress bar for processing */}
              {file.processingStatus === 'processing' && uploadProgress[file.id] !== undefined && (
                <div className="w-16 bg-muted rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress[file.id]}%` }}
                  />
                </div>
              )}
              
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0" 
                onClick={() => onFileRemove(file.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


