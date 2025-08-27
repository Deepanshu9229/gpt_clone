"use client"

import { useState } from 'react'
import { Widget } from '@uploadcare/react-widget'
import { Button } from './ui/button'
import { Paperclip, X } from 'lucide-react'

interface AttachedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  extractedText?: string
}

interface FileUploadProps {
  attachedFiles: AttachedFile[]
  onFileAttach: (file: AttachedFile) => void
  onFileRemove: (fileId: string) => void
}

export function FileUpload({ attachedFiles, onFileAttach, onFileRemove }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

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
            setIsUploading(true)
            try {
              const response = await fetch('/api/files/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  fileUrl: fileInfo.cdnUrl,
                  fileName: fileInfo.name,
                  fileType: fileInfo.mimeType,
                  fileSize: fileInfo.size,
                }),
              })
              const result = await response.json()
              onFileAttach({
                id: result.fileId,
                name: fileInfo.name,
                size: fileInfo.size,
                type: fileInfo.mimeType,
                url: fileInfo.cdnUrl,
                extractedText: result.extractedText,
              })
            } catch (error) {
              console.error('File processing failed:', error)
            } finally {
              setIsUploading(false)
            }
          }
        }}
      >
        <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" disabled={isUploading}>
          <Paperclip className="h-5 w-5" />
        </Button>
      </Widget>

      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {attachedFiles.map((file) => (
            <div key={file.id} className="flex items-center gap-1 bg-muted rounded-md px-2 py-1 text-xs">
              <span className="truncate max-w-24">{file.name}</span>
              <Button type="button" variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => onFileRemove(file.id)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


