
import { toast } from "sonner";

// File size constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

// Interface for our brochure files
export interface BrochureFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  url: string;
  downloadCount: number;
}

export const validateFile = (file: File): { valid: boolean; message?: string } => {
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      message: `File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.` 
    };
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      message: "Invalid file type. Please upload PDF, Word, or Excel files." 
    };
  }

  return { valid: true };
};

export const handleFileUpload = async (
  file: File,
  onSuccess: (file: BrochureFile) => void
): Promise<void> => {
  try {
    // Validate the file
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    // In a real app, we would upload to a server here
    // For now, we'll create a mock URL and mock the upload process
    const mockUrl = URL.createObjectURL(file);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create brochure object
    const brochure: BrochureFile = {
      id: `brochure-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString(),
      url: mockUrl,
      downloadCount: 0
    };
    
    onSuccess(brochure);
    toast.success(`Successfully uploaded ${file.name}`);
  } catch (error) {
    console.error("File upload error:", error);
    toast.error("Failed to upload file. Please try again.");
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
};

export const formatFileDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
