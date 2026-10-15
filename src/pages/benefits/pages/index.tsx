import React from 'react';
import { Routes, Route } from 'react-router-dom';

import MyPerksPage from '../pages/MyPerks';
import RecreationBenefitsPage from '../pages/RecreatinalBenefits';
import PerkTypesPage from '../pages/PerksType';
import OptInBenefitsPage from './OptInBenefitsPage';

// Replace with your app's auth hook or Redux selector
import { useAuth } from '@/hooks/useAuth';

const BenefitsPerksModule: React.FC = () => {
  const { user, isLoading } = useAuth(); // e.g. useAppSelector((state) => state.auth.user)

  // Wait for user state to hydrate before rendering child routes
  if (isLoading || !user?.id) {
    return <div className="p-6 text-gray-500">Loading user session...</div>;
  }

  return (
    <Routes>
      <Route index element={<MyPerksPage />} />
      <Route path="my-perks" element={<MyPerksPage />} />
      <Route path="opt-in-benefits" element={<OptInBenefitsPage userId={user.id} />} />
      <Route path="recreation-benefits" element={<RecreationBenefitsPage />} />
      <Route path="perk-types" element={<PerkTypesPage />} />
    </Routes>
  );
};

export default BenefitsPerksModule;
