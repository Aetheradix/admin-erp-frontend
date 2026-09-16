import { Routes, Route } from 'react-router-dom';

import MyPerksPage from '../pages/MyPerks';
import RecreationBenefitsPage from '../pages/RecreatinalBenefits';
import PerkTypesPage from '../pages/PerksType';
import OptInBenefitsPage from './OptInBenefitsPage';
const BenefitsPerksModule = () => {
  return (
    <Routes>
      {/* Matches /benefits-perks */}
      <Route index element={<MyPerksPage />} />

      {/* Matches /benefits-perks/my-perks */}
      <Route path="my-perks" element={<MyPerksPage />} />
      <Route path="opt-in-benefits" element={<OptInBenefitsPage />} />
      {/* Matches /benefits-perks/recreation-benefits */}
      <Route path="recreation-benefits" element={<RecreationBenefitsPage />} />

      {/* Matches /benefits-perks/perk-types */}
      <Route path="perk-types" element={<PerkTypesPage />} />
    </Routes>
  );
};

export default BenefitsPerksModule;
