import { Routes, Route } from 'react-router-dom';

import RecreationalBenefitsPage from './RecretionalBenefitsPage';
import CreateRecreationalBenefitPage from './CreateBenefitsPage';
import RecreationalBenefitDetailsPage from './RecreationalBenefitsDetailsPage';
import MyRecreationalBenefitsPage from './MyRecreationalBenefitsPage';

const RecreationalBenefitsModule = () => {
  return (
    <Routes>
      <Route index element={<RecreationalBenefitsPage />} />
      <Route path="perks" element={<RecreationalBenefitsPage />} />

      {/* 2. Create Benefit Page */}
      <Route path="create" element={<CreateRecreationalBenefitPage />} />

      {/* 3. My Benefits (Employee View) */}
      <Route path="my-benefits" element={<MyRecreationalBenefitsPage />} />

      {/* 4. Benefit Details */}
      <Route path=":benefitId" element={<RecreationalBenefitDetailsPage />} />
    </Routes>
  );
};

export default RecreationalBenefitsModule;
