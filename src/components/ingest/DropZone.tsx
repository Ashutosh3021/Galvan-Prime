import { useCallback, useState } from 'react';
import { Icon } from '../ui/Icon';

interface DropZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED = ['.pdf', '.txt', '.md', '.docx', '.csv'];
const ACCEPT_TYPES = 'application/pdf,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/csv';

export function DropZone({ onFile, disabled = false }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const validate = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED.includes(ext)) return `Unsupported file type: ${ext}`;
    if (file.size > 50 * 1024 * 1024) return 'File exceeds 50 MB limit';
    return null;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (!file) return;
      const err = validate(file);
      if (err) { setDragError(err); return; }
      setDragError(null);
      onFile(file);
    },
    [disabled, onFile],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validate(file);
    if (err) { setDragError(err); return; }
    setDragError(null);
    onFile(file);
    e.target.value = '';
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Drop zone — drag and drop a file here or click to browse"
      aria-disabled={disabled}
      onDragOver={e => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          document.getElementById('dropzone-input')?.click();
        }
      }}
      className={`
        relative border-2 border-dashed rounded-xl p-10 text-center
        transition-all duration-200 bg-grid-pattern
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isDragging
          ? 'border-primary-container bg-primary-container/5 scale-[1.01]'
          : dragError
            ? 'border-[#ef4444]/60 bg-[#ef4444]/5'
            : 'border-surface-container-high hover:border-primary-container/50 hover:bg-surface-container/50'
        }
      `}
    >
      <div className="flex justify-center mb-4">
        <Icon
          name={isDragging ? 'file_download' : 'cloud_upload'}
          size={48}
          className={`transition-colors ${isDragging ? 'text-primary-container' : 'text-on-surface-variant'}`}
        />
      </div>

      <p className="text-[16px] font-semibold text-on-surface mb-1">
        {isDragging ? 'Drop to ingest' : 'Drag & drop a file here'}
      </p>
      <p className="text-[14px] text-on-surface-variant mb-5">or click to browse your files</p>

      <label
        htmlFor="dropzone-input"
        className={`
          inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
          bg-primary-container text-on-primary font-semibold text-[13px]
          hover:brightness-110 transition-all cursor-pointer active:scale-95
          ${disabled ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <Icon name="folder_open" size={16} />
        Browse Files
      </label>
      <input
        id="dropzone-input"
        type="file"
        className="sr-only"
        accept={ACCEPT_TYPES}
        onChange={handleFileInput}
        disabled={disabled}
        aria-hidden="true"
      />

      <p className="text-[12px] text-on-surface-variant/60 mt-4">
        PDF, TXT, MD, DOCX, CSV · Max 50 MB
      </p>

      {dragError && (
        <p role="alert" className="mt-3 text-[13px] font-semibold text-[#ef4444] flex items-center justify-center gap-1">
          <Icon name="error" size={14} />
          {dragError}
        </p>
      )}
    </div>
  );
}
