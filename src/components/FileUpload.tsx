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
  fileName: string
  fileType: string
  fileUrl: string
  extractedText?: string
  summary?: string
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed'
  errorMessage?: string
  size?: number
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
    // Check file size
    if (!file.size || file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
    }

    // Handle cases where mimeType might be undefined
    let mimeType = file.mimeType || file.type || '';
    
    // If no mimeType, try to infer from filename
    if (!mimeType && file.name) {
      const fileName = file.name;
      const extension = fileName.split('.').pop()?.toLowerCase();
      
      if (extension && extension.length > 0 && extension.length < 10) {
        const supportedExtensions = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'xlsx', 'xls', 'csv'];
        if (supportedExtensions.includes(extension)) {
          // Map extension to MIME type for validation
          const extensionToMime: { [key: string]: string } = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'txt': 'text/plain',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'xls': 'application/vnd.ms-excel',
            'csv': 'text/csv'
          };
          mimeType = extensionToMime[extension] || '';
        }
      }
    }
    
    // Special handling for Uploadcare widget states
    if (!mimeType) {
      // Check if this is a valid file upload (not a placeholder or error state)
      if (file.name === '1 file' || file.name === '0 files' || file.name === 'files') {
        throw new Error('Please select a valid file to upload. The current selection appears to be incomplete.');
      }
      
      // Check if we have a valid URL
      if (!file.cdnUrl || file.cdnUrl.includes('~1')) {
        throw new Error('File upload appears to be incomplete. Please try uploading the file again.');
      }
      
      throw new Error('Unable to determine file type. Please ensure the file has a valid extension and try again.');
    }

    // Check if file type is supported
    const isSupported = SUPPORTED_TYPES.some(type => 
      mimeType.startsWith(type)
    );
    
    if (!isSupported) {
      throw new Error('File type not supported. Please upload images, PDFs, Word docs, or text files.');
    }

    return true;
  };

  const getFileIcon = (fileType: string | undefined) => {
    if (!fileType) return <File className="h-4 w-4" />
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

  const handleFileUpload = async (fileInfo: any) => {
    try {
      console.log('📁 Processing completed file upload:', fileInfo);
      
      // Check if we have essential file properties
      if (!fileInfo.cdnUrl || !fileInfo.name || fileInfo.size === 0) {
        console.log('⚠️ Missing essential file properties, skipping processing');
        return;
      }
      
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

      // Determine the best file type to send
      let fileTypeToSend = fileInfo.mimeType || fileInfo.type || '';
      if (!fileTypeToSend && fileInfo.name) {
        const extension = fileInfo.name.split('.').pop()?.toLowerCase();
        if (extension && extension.length > 0 && extension.length < 10) {
          const extensionToMime: { [key: string]: string } = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'txt': 'text/plain',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'xls': 'application/vnd.ms-excel',
            'csv': 'text/csv'
          };
          fileTypeToSend = extensionToMime[extension] || '';
        }
      }

      console.log('📁 Sending file to processing API:', {
        fileUrl: fileInfo.cdnUrl,
        fileName: fileInfo.name,
        fileType: fileTypeToSend,
        fileSize: fileInfo.size,
      });
      
      const response = await fetch('/api/files/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: fileInfo.cdnUrl,
          fileName: fileInfo.name,
          fileType: fileTypeToSend,
          fileSize: fileInfo.size,
        }),
      });
      
      console.log('📁 Processing API response status:', response.status);
      const result = await response.json();
      console.log('📁 Processing API result:', result);
      
      if (result.success) {
        setUploadProgress(prev => ({ ...prev, [fileInfo.uuid]: 100 }));
        
        const attachedFile = {
          id: result.fileId || fileInfo.uuid,
          fileName: fileInfo.name,
          fileType: fileTypeToSend || fileInfo.mimeType || 'unknown',
          fileUrl: fileInfo.cdnUrl,
          extractedText: result.extractedText,
          summary: result.summary,
          processingStatus: 'completed' as const,
          size: fileInfo.size
        };
        console.log('📁 File attached successfully:', attachedFile);
        console.log('📁 Calling onFileAttach with:', attachedFile);
        onFileAttach(attachedFile);
        console.log('📁 onFileAttach called successfully');
      } else {
        throw new Error(result.error || 'File processing failed');
      }
    } catch (error: any) {
      console.error('File processing failed:', error);
      // Show error in UI
      onFileAttach({
        id: fileInfo.uuid || Date.now().toString(),
        fileName: fileInfo.name || 'Unknown file',
        fileType: fileInfo.mimeType || fileInfo.type || 'unknown',
        fileUrl: fileInfo.cdnUrl || '',
        processingStatus: 'failed' as const,
        errorMessage: error.message,
        size: fileInfo.size || 0
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(prev => {
        const { [fileInfo.uuid]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Widget
          publicKey={process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY as string}
          id="file-uploader"
          multiple={true}
          tabs="file url"
          previewStep={true}
          onFileSelect={(fileInfo: any) => {
            console.log('📁 onFileSelect triggered:', fileInfo);
          }}
          onUploadComplete={(fileInfo: any) => {
            console.log('📁 onUploadComplete triggered:', fileInfo);
            // This event fires when the file upload is actually complete
            if (fileInfo && fileInfo.cdnUrl && !fileInfo.cdnUrl.includes('~1')) {
              console.log('📁 File upload completed, processing file:', fileInfo);
              // Process the completed file
              handleFileUpload(fileInfo);
            }
          }}
          onChange={(fileInfo: any) => {
            console.log('📁 onChange triggered with fileInfo:', fileInfo);
            
            // Only process if this looks like a real file (not a placeholder)
            if (fileInfo && 
                fileInfo.uuid && 
                fileInfo.name && 
                fileInfo.name !== '1 file' && 
                fileInfo.name !== '0 files' && 
                fileInfo.name !== 'files' &&
                fileInfo.cdnUrl && 
                !fileInfo.cdnUrl.includes('~1') &&
                fileInfo.size && 
                fileInfo.size > 100) {
              
              console.log('📁 Real file detected in onChange, attempting to process:', fileInfo);
              handleFileUpload(fileInfo);
            } else {
              // Only log if this is actually a file object, not just typing events
              if (fileInfo && (fileInfo.uuid || fileInfo.name || fileInfo.cdnUrl)) {
                console.log('📁 Placeholder or incomplete file, skipping:', {
                  name: fileInfo?.name,
                  size: fileInfo?.size,
                  cdnUrl: fileInfo?.cdnUrl,
                  uuid: fileInfo?.uuid
                });
              }
            }
          }}
          locale={{
            buttons: {
              choose: {
                files: {
                  one: 'Choose file',
                  other: 'Choose files'
                }
              }
            }
          }}
          style={{
            position: 'absolute',
            opacity: 0,
            pointerEvents: 'none',
            width: '1px',
            height: '1px'
          }}
        />
        
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-foreground rounded-full p-2" 
          disabled={isUploading}
          onClick={() => {
            // Trigger the hidden Uploadcare widget
            const widget = document.querySelector('[data-uploadcare-widget]') as HTMLElement;
            if (widget) {
              widget.click();
            }
          }}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
      </div>

      {/* File List with Enhanced UI */}
      {attachedFiles.length > 0 && (
        <div className="mt-3 space-y-2">
          {attachedFiles.map((file) => (
            <div key={file.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
              {getFileIcon(file.fileType)}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{file.fileName}</div>
                <div className="text-xs text-muted-foreground">
                  {file.fileType || 'Unknown type'}
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
                {file.processingStatus === 'completed' && file.summary && (
                  <div className="text-xs text-green-600">✓ {file.summary}</div>
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


