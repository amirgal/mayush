import { useState, useRef, useEffect } from 'react';
import { useConvex } from 'convex/react';
import type { FunctionReference } from 'convex/server';
import type { Id } from '../../../convex/_generated/dataModel';
import type { ImageAttachment } from '../../types';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';

type FileUploadProps = {
  onImagesChange: (images: ImageAttachment[]) => void;
  disabled?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
};

const FileUpload: React.FC<FileUploadProps> = ({
  onImagesChange,
  disabled = false,
  maxFiles = 3,
  maxSizeMB = 5,
}) => {
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use the Convex client directly since the generated API doesn't include our new functions yet
  const convex = useConvex();
  
  // Helper function to call untyped mutations
  const callUntypedMutation = async <T,>(name: string, args: Record<string, unknown> = {}): Promise<T> => {
    try {
      // Cast to unknown first, then to the specific type for better type safety
      const functionRef = name as unknown as FunctionReference<"mutation">;
      return await convex.mutation(functionRef, args);
    } catch (error) {
      console.error(`Error calling mutation ${name}:`, error);
      throw error;
    }
  };
  
  // Helper function to call untyped queries
  const callUntypedQuery = async <T,>(name: string, args: Record<string, unknown> = {}): Promise<T> => {
    try {
      // Cast to unknown first, then to the specific type for better type safety
      const functionRef = name as unknown as FunctionReference<"query">;
      return await convex.query(functionRef, args);
    } catch (error) {
      console.error(`Error calling query ${name}:`, error);
      throw error;
    }
  };

  // Update parent component when images change
  useEffect(() => {
    onImagesChange(images);
  }, [images, onImagesChange]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    await uploadFiles(Array.from(e.target.files));
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    await uploadFiles(Array.from(e.dataTransfer.files));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const uploadFiles = async (files: File[]) => {
    setError(null);
    
    // Check if adding these files would exceed the maximum
    if (images.length + files.length > maxFiles) {
      setError(`You can only upload a maximum of ${maxFiles} images`);
      return;
    }
    
    // Check file types and sizes
    const validFiles = files.filter(file => {
      // Check file type
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setError('Only JPEG and PNG images are allowed');
        return false;
      }
      
      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`Files must be smaller than ${maxSizeMB}MB`);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    setUploading(true);
    
    try {
      // Upload each file
      const uploadPromises = validFiles.map(async (file) => {
        // Get upload URL from Convex using our helper function
        const uploadUrl = await callUntypedMutation<string>('files:generateUploadUrl');
        
        // Upload file directly to storage provider
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Content-Type': file.type,
          },
          body: file,
        });
        
        if (!result.ok) {
          throw new Error(`Upload failed with status: ${result.status}`);
        }
        
        // Get the storageId from the response
        const { storageId } = await result.json();
        
        // Validate the uploaded file on the server
        await callUntypedMutation('files:validateFileUpload', { storageId: storageId as Id<'_storage'> });
        
        // Get a permanent URL for the file from Convex storage for database storage
        const url = await callUntypedQuery<string>('files:getUrl', { storageId: storageId });
        
        // Create a temporary blob URL for preview in the upload area
        const previewUrl = URL.createObjectURL(file);
        
        return {
          storageId: storageId as Id<'_storage'>,
          url, // Permanent URL for database storage
          previewUrl, // Temporary URL for preview
        };
      });
      
      const newImages = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...newImages]);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors ${dragActive ? 'border-book-accent bg-book-accent/10' : 'border-gray-300 hover:border-book-accent/50'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={disabled ? undefined : openFileDialog}
        onDrop={disabled ? undefined : handleDrop}
        onDragOver={disabled ? undefined : handleDragOver}
        onDragLeave={disabled ? undefined : handleDragLeave}
        aria-disabled={disabled}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/jpg"
          className="hidden"
          multiple
          disabled={disabled || uploading || images.length >= maxFiles}
          aria-label="Upload images"
          tabIndex={-1} // We're using the div for keyboard interaction
        />
        
        <div className="flex flex-col items-center justify-center py-3">
          <PhotoIcon className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">
            {uploading ? (
              'Uploading...'
            ) : images.length >= maxFiles ? (
              `Maximum of ${maxFiles} images reached`
            ) : (
              <>
                <span className="font-medium text-book-accent">Click to upload</span> or drag and drop
                <br />
                <span className="text-xs">JPEG or PNG, up to {maxSizeMB}MB</span>
              </>
            )}
          </p>
        </div>
      </div>
      
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
      
      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {images.map((image, index) => (
            <div key={image.storageId} className="relative rounded-md overflow-hidden h-24 bg-gray-100">
              <img 
                src={image.previewUrl || image.url} 
                alt={`Uploaded preview ${index + 1}`} 
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white hover:bg-black/70 transition-colors"
                aria-label="Remove image"
                tabIndex={0}
                disabled={disabled}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
