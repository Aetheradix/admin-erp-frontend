import { Routes, Route } from 'react-router-dom';
import ChannelsPage from './ChannelsPage';

export default function ChannelsModule() {
  return (
    <Routes>
      <Route path="/" element={<ChannelsPage />} />
      <Route path="/:channelId" element={<ChannelsPage />} />
    </Routes>
  );
}
