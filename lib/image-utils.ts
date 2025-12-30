/**
 * Image utilities for avatar upload
 */

/**
 * Compress image before upload
 * @param file - Original image file
 * @param maxSizeMB - Maximum size in MB (default: 1MB)
 * @param maxWidthOrHeight - Maximum width or height (default: 800px)
 * @returns Compressed image file
 */
export async function compressImage(
  file: File,
  maxSizeMB: number = 1,
  maxWidthOrHeight: number = 800
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidthOrHeight) {
            height = (height * maxWidthOrHeight) / width;
            width = maxWidthOrHeight;
          }
        } else {
          if (height > maxWidthOrHeight) {
            width = (width * maxWidthOrHeight) / height;
            height = maxWidthOrHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with quality adjustment
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            
            // Create new file from blob
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            
            // Check if compressed file is smaller
            if (compressedFile.size < file.size) {
              resolve(compressedFile);
            } else {
              resolve(file); // Return original if compression didn't help
            }
          },
          file.type,
          0.8 // Quality (0-1)
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 * @param file - File to validate
 * @param maxSizeMB - Maximum size in MB
 * @param allowedTypes - Allowed MIME types
 * @returns Error message or null if valid
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 5,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']
): string | null {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    const types = allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ');
    return `Chỉ chấp nhận file ${types}`;
  }
  
  // Check file size
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return `File không được vượt quá ${maxSizeMB}MB`;
  }
  
  return null;
}

/**
 * Create a square crop from center of image
 * @param file - Original image file
 * @param size - Output size (default: 400px)
 * @returns Cropped image file
 */
export async function cropImageToSquare(
  file: File,
  size: number = 400
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Calculate crop dimensions (center crop)
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        
        // Draw cropped image
        ctx.drawImage(
          img,
          sx, sy, minDim, minDim, // Source
          0, 0, size, size // Destination
        );
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to crop image'));
              return;
            }
            
            const croppedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            
            resolve(croppedFile);
          },
          file.type,
          0.9
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Process image: compress and crop to square
 * @param file - Original image file
 * @returns Processed image file
 */
export async function processAvatarImage(file: File): Promise<File> {
  try {
    // First crop to square
    const cropped = await cropImageToSquare(file, 400);
    
    // Then compress
    const compressed = await compressImage(cropped, 1, 400);
    
    return compressed;
  } catch (error) {
    console.error('Error processing image:', error);
    // Return original file if processing fails
    return file;
  }
}
