'use client';

import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  type FirebaseStorage,
} from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export type UploadProgress = {
  progress: number;
  status: 'uploading' | 'success' | 'error';
  downloadURL?: string;
};

export const uploadFile = (
  storage: FirebaseStorage,
  path: string,
  file: File,
  onProgress: (progress: UploadProgress) => void
): (() => void) => {
  const fileId = uuidv4();
  const fileRef = ref(storage, `${path}/${fileId}-${file.name}`);
  const uploadTask = uploadBytesResumable(fileRef, file);

  const unsubscribe = uploadTask.on(
    'state_changed',
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      onProgress({ progress, status: 'uploading' });
    },
    (error) => {
      console.error('Upload failed:', error);
      onProgress({ progress: 0, status: 'error' });
    },
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        onProgress({
          progress: 100,
          status: 'success',
          downloadURL,
        });
      });
    }
  );

  return () => {
    unsubscribe();
    // You might want to add cancel logic here if needed
    // uploadTask.cancel();
  };
};
