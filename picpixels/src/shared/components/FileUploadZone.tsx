'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, File, CheckCircle, AlertCircle } from 'lucide-react';
import styles from './FileUploadZone.module.css';

interface FileItem {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
}

interface FileUploadZoneProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
}

let fileIdCounter = 0;

export default function FileUploadZone({
  onFilesChange,
  maxFiles = 10,
  maxSizeMB = 25,
  accept = '*/*',
}: FileUploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [items, setItems] = useState<FileItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(fileList: FileList) {
    const remaining = maxFiles - items.length;
    const newItems: FileItem[] = [];
    for (let i = 0; i < Math.min(fileList.length, remaining); i++) {
      const f = fileList[i];
      newItems.push({
        file: f,
        id: `file_${++fileIdCounter}`,
        progress: 100,
        status: 'done',
      });
    }
    const updated = [...items, ...newItems];
    setItems(updated);
    onFilesChange(updated.map((x) => x.file));
  }

  function removeFile(id: string) {
    setItems((prev) => {
      const updated = prev.filter((x) => x.id !== id);
      onFilesChange(updated.map((x) => x.file));
      return updated;
    });
  }

  function handleDrag(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragActive(true);
    else if (e.type === 'dragleave') setIsDragActive(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      addFiles(e.target.files);
      e.target.value = '';
    }
  }

  function formatBytes(bytes: number) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  const isFull = items.length >= maxFiles;

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.dropZone} ${isDragActive ? styles.dropZoneActive : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isFull && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleInputChange}
          className={styles.inputHidden}
        />
        <div className={styles.dropIcon}>
          <Upload size={28} />
        </div>
        <p className={styles.dropTitle}>
          {isDragActive ? 'Drop your files here' : 'Drag & drop your files here'}
        </p>
        <p className={styles.dropDesc}>
          or <span className={styles.browseText}>browse files</span> &mdash; {accept === '*/*' ? 'any format' : accept} up to {maxSizeMB}MB each (max {maxFiles})
        </p>
      </div>

      {items.length > 0 && (
        <ul className={styles.fileList}>
          {items.map((item) => (
            <li key={item.id} className={styles.fileItem}>
              <div className={styles.fileIcon}>
                <File size={18} />
              </div>
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{item.file.name}</span>
                <span className={styles.fileSize}>{formatBytes(item.file.size)}</span>
              </div>
              <div className={styles.fileStatus}>
                {item.status === 'done' && <CheckCircle size={16} className={styles.statusDone} />}
                {item.status === 'error' && <AlertCircle size={16} className={styles.statusError} />}
              </div>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={(e) => { e.stopPropagation(); removeFile(item.id); }}
                aria-label={`Remove ${item.file.name}`}
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
