import { useState } from "react";
import { Upload, X, FileText, Lock, Zap } from "lucide-react";
import { parseResumeFromPdf } from "../../../services/openaiResumeParser";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";
import type { Resume } from "../../../types/resume";

const defaultFileState = {
  name: "",
  size: 0,
  fileUrl: "",
};

interface ResumeDropzoneProps {
  onResumeExtracted: (resume: Resume) => void;
  onFileUrlChange?: (fileUrl: string) => void;
  className?: string;
  disabled?: boolean;
}

export const ResumeDropzone = ({
  onResumeExtracted,
  onFileUrlChange,
  className,
  disabled = false,
}: ResumeDropzoneProps) => {
  const [file, setFile] = useState(defaultFileState);
  const [isHoveredOnDropzone, setIsHoveredOnDropzone] = useState(false);
  const [hasNonPdfFile, setHasNonPdfFile] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasFile = Boolean(file.name);

  const setNewFile = (newFile: File) => {
    if (file.fileUrl) {
      URL.revokeObjectURL(file.fileUrl);
    }

    const { name, size } = newFile;
    const fileUrl = URL.createObjectURL(newFile);
    setFile({ name, size, fileUrl });
    onFileUrlChange?.(fileUrl);
    setError(null);
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    
    const newFile = event.dataTransfer.files[0];
    if (newFile?.name.endsWith(".pdf")) {
      setHasNonPdfFile(false);
      setNewFile(newFile);
    } else {
      setHasNonPdfFile(true);
    }
    setIsHoveredOnDropzone(false);
  };

  const onInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || disabled) return;

    const newFile = files[0];
    if (newFile?.name.endsWith(".pdf")) {
      setHasNonPdfFile(false);
      setNewFile(newFile);
    } else {
      setHasNonPdfFile(true);
    }
  };

  const onRemove = () => {
    if (file.fileUrl) {
      URL.revokeObjectURL(file.fileUrl);
    }
    setFile(defaultFileState);
    onFileUrlChange?.("");
    setError(null);
  };

  const onParseClick = async () => {
    if (!file.fileUrl) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const resume = await parseResumeFromPdf(file.fileUrl);
      onResumeExtracted(resume);
    } catch (err) {
      console.error("Error parsing resume:", err);
      setError("Failed to parse resume. Please make sure the PDF is readable and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getFileSizeString = (fileSizeB: number) => {
    const fileSizeKB = fileSizeB / 1024;
    const fileSizeMB = fileSizeKB / 1024;
    if (fileSizeKB < 1000) {
      return fileSizeKB.toPrecision(3) + " KB";
    } else {
      return fileSizeMB.toPrecision(3) + " MB";
    }
  };

  return (
    <div
      className={cn(
        "flex justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-12 transition-all duration-200",
        isHoveredOnDropzone && !disabled && "border-blue-400 bg-blue-50 scale-[1.02]",
        disabled && "opacity-50 cursor-not-allowed",
        !hasFile && "hover:border-gray-400 hover:bg-gray-50",
        className
      )}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setIsHoveredOnDropzone(true);
      }}
      onDragLeave={() => setIsHoveredOnDropzone(false)}
      onDrop={onDrop}
    >
      <div className="text-center space-y-4">
        {!hasFile ? (
          <>
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Upload className="h-full w-full" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                Upload your resume PDF
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Drag and drop your PDF file here, or click to browse
              </p>
            </div>
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Lock className="mr-1 h-3 w-3" />
              File data is processed locally and never leaves your browser
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div className="text-left">
                <div className="font-semibold text-gray-900">{file.name}</div>
                <div className="text-sm text-gray-500">
                  {getFileSizeString(file.size)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                disabled={disabled || isProcessing}
                className="ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            
            <Button
              onClick={onParseClick}
              disabled={disabled || isProcessing}
              className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Parsing Resume...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Parse Resume & Auto-fill
                </>
              )}
            </Button>
            
            <p className="text-xs text-gray-500">
              Powered by AI - Works with any resume format and layout
            </p>
          </div>
        )}

        {!hasFile && (
          <div>
            <label className="cursor-pointer inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
              <Upload className="w-4 h-4 mr-2" />
              Browse Files
              <input
                type="file"
                className="sr-only"
                accept=".pdf"
                onChange={onInputChange}
                disabled={disabled}
              />
            </label>
            {hasNonPdfFile && (
              <p className="mt-2 text-sm text-red-600">
                Only PDF files are supported
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 