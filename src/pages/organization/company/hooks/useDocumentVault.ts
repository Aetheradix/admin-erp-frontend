import { useEffect, useMemo, useState } from 'react';
import { message } from 'antd';
import { useUploadImageMutation } from '@/store/api/uploadSlice';
import { DOCUMENTS_STORAGE_KEY, INITIAL_DOCUMENTS, INITIAL_POLICIES } from '../constants';
import type { CompanyDocument, UploadDocumentForm } from '../types';

const EMPTY_UPLOAD_FORM: UploadDocumentForm = {
  title: '',
  category: 'Certificate',
  visibility: 'Public',
  description: '',
};

function readStoredDocuments(): CompanyDocument[] {
  try {
    const saved = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
    if (saved) return JSON.parse(saved) as CompanyDocument[];
  } catch {
    // Ignore malformed storage payloads and fall back to the seeded vault.
  }
  return INITIAL_DOCUMENTS;
}

export function useDocumentVault(canManageOrg: boolean) {
  const [documents, setDocuments] = useState<CompanyDocument[]>(readStoredDocuments);
  const policies = INITIAL_POLICIES;

  useEffect(() => {
    try {
      localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(documents));
    } catch {
      // Storage may be unavailable (private mode/quota); the in-memory vault still works.
    }
  }, [documents]);

  const visibleDocuments = useMemo(() => {
    if (canManageOrg) return documents;
    return documents.filter((doc) => doc.visibility === 'Public');
  }, [canManageOrg, documents]);

  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDocForm, setUploadDocForm] = useState<UploadDocumentForm>(EMPTY_UPLOAD_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleteDocId, setDeleteDocId] = useState<number | string | null>(null);

  const openUploadModal = () => setShowUploadModal(true);
  const closeUploadModal = () => setShowUploadModal(false);

  const submitUpload = async () => {
    if (!uploadDocForm.title) {
      message.error('Please enter a document title.');
      return;
    }

    let downloadUrl = '#';
    let fileSizeStr = '1.2 MB';

    if (selectedFile) {
      fileSizeStr = `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`;
      try {
        const res = await uploadImage({ file: selectedFile, category: 'general' }).unwrap();
        if (res.data?.url) downloadUrl = res.data.url;
      } catch {
        // Fallback to local URL for offline / sandbox
        downloadUrl = URL.createObjectURL(selectedFile);
      }
    }

    const newDoc: CompanyDocument = {
      id: Date.now(),
      title: uploadDocForm.title,
      category: uploadDocForm.category,
      fileSize: fileSizeStr,
      uploadDate: new Date().toISOString().split('T')[0],
      visibility: uploadDocForm.visibility,
      downloadUrl,
      description: uploadDocForm.description || 'Uploaded company document.',
    };

    setDocuments([newDoc, ...documents]);
    setShowUploadModal(false);
    setUploadDocForm(EMPTY_UPLOAD_FORM);
    setSelectedFile(null);
    message.success('Document uploaded and indexed successfully!');
  };

  const toggleVisibility = (id: number | string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === id) {
          const nextVisibility = doc.visibility === 'Public' ? 'Private' : 'Public';
          message.info(`${doc.title} is now ${nextVisibility}.`);
          return { ...doc, visibility: nextVisibility };
        }
        return doc;
      })
    );
  };

  const requestDelete = (id: number | string) => setDeleteDocId(id);
  const closeDeleteConfirm = () => setDeleteDocId(null);

  const confirmDelete = () => {
    if (!deleteDocId) return;
    setDocuments((prev) => prev.filter((doc) => doc.id !== deleteDocId));
    setDeleteDocId(null);
    message.success('Document removed from vault.');
  };

  return {
    documents,
    policies,
    visibleDocuments,
    isUploading,
    showUploadModal,
    uploadDocForm,
    setUploadDocForm,
    selectedFile,
    setSelectedFile,
    deleteDocId,
    openUploadModal,
    closeUploadModal,
    submitUpload,
    toggleVisibility,
    requestDelete,
    closeDeleteConfirm,
    confirmDelete,
  };
}
