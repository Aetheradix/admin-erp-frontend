import { useState } from 'react';
import type { ProfileCompletionData } from '@/services/employeeProfileService';
import type { ReviewTab } from '../types';

interface UseHiringReviewParams {
  setSelectedProfile: (profile: ProfileCompletionData | null) => void;
}

export function useHiringReview({ setSelectedProfile }: UseHiringReviewParams) {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewTab, setReviewTab] = useState<ReviewTab>('overview');

  const openReview = (profile: ProfileCompletionData) => {
    setSelectedProfile(profile);
    setReviewTab('overview');
    setIsReviewOpen(true);
  };

  const closeReview = () => setIsReviewOpen(false);

  return { isReviewOpen, reviewTab, setReviewTab, openReview, closeReview };
}
