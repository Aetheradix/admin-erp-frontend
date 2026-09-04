import { Routes, Route } from 'react-router-dom';

import ResourceBookingPage from './ResourceBooking';
import MyBookingsPage from './MyBookingsPage';
import AllBookingsPage from './AllBookingsPage';
import ResourceCalendarPage from './ResourceCalendarPage';

// Inside ResourceBookingModule.tsx
const ResourceBookingModule = () => {
  return (
    <Routes>
      {/* Matches /resource-booking */}
      <Route index element={<ResourceBookingPage />} />
      
      {/* Matches /resource-booking/my-bookings */}
      <Route path="my-bookings" element={<MyBookingsPage />} />
      
      {/* Matches /resource-booking/calendar */}
      <Route path="calendar" element={<ResourceCalendarPage />} />
      
      {/* Matches /resource-booking/all */}
      <Route path="all" element={<AllBookingsPage />} />
    </Routes>
  );
};

export default ResourceBookingModule;