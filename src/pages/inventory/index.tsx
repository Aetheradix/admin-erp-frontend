import { Routes, Route } from 'react-router-dom';
import { ItemsPage } from './ItemsPage';
import { StockLevelsPage } from './StockLevelsPage';
import { MovementsPage } from './MovementsPage';

const InventoryModule = () => {
  return (
    <Routes>
      <Route path="/" element={<ItemsPage />} />
      <Route path="/stock-levels" element={<StockLevelsPage />} />
      <Route path="/movements" element={<MovementsPage />} />
    </Routes>
  );
};

export default InventoryModule;
