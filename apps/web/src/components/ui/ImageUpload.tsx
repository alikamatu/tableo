'use client';

import * as React from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { uploadImage } from '@/lib/upload';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  disabled?: boolean;
  className?: string;
  folder?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled,
  className,
  folder = 'tableo/menu',
}: ImageUploadProps) {
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadImage(file, folder);
      onChange(res.url);
      toast.success('Image uploaded');
    } catch (err: any) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('w-full space-y-4', className)}>
      <div className="flex items-center gap-4">
        {value ? (
          <div className="group relative h-40 w-40 overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
            <img src={value} alt="Upload" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={onRemove}
                disabled={disabled}
                className="bg-destructive text-destructive-foreground flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
            className={cn(
              'border-muted-foreground/20 hover:border-primary/50 flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-muted/30 transition-all hover:bg-muted/50',
              (disabled || uploading) && 'cursor-not-allowed opacity-60',
            )}
          >
            {uploading ? (
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            ) : (
              <>
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                  <Upload size={24} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">Click to upload</p>
                  <p className="text-muted-foreground mt-0.5 text-[10px] font-medium">
                    SVG, PNG, JPG or WebP (max. 10MB)
                  </p>
                </div>
              </>
            )}
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled || uploading}
        />
      </div>
    </div>
  );
}
