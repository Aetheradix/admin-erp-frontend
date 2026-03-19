import { apiSlice } from './apiSlice';

// A simple mock backend using localStorage to ensure the UI toggles work flawlessly for demo
const getMockState = () => {
  const data = localStorage.getItem('mockAttendance');
  return data ? JSON.parse(data) : { status: 'checked-out', lastAction: null };
};

const setMockState = (state: any) => {
  localStorage.setItem('mockAttendance', JSON.stringify(state));
};

export const attendanceSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAttendanceStatus: builder.query<{ status: 'checked-in' | 'checked-out'; lastAction?: string }, void>({
      queryFn: () => {
        return { data: getMockState() };
      },
      providesTags: ['Attendance'],
    }),
    checkIn: builder.mutation<{ success: boolean; time: string }, { timestamp: string }>({
      queryFn: (arg) => {
        const newState = { status: 'checked-in', lastAction: arg.timestamp };
        setMockState(newState);
        return { data: { success: true, time: arg.timestamp } };
      },
      invalidatesTags: ['Attendance'],
    }),
    checkOut: builder.mutation<{ success: boolean; time: string }, { timestamp: string }>({
      queryFn: (arg) => {
        // When checking out, we keep the lastAction as the checkout time so we can display "Last out"
        const newState = { status: 'checked-out', lastAction: arg.timestamp };
        setMockState(newState);
        return { data: { success: true, time: arg.timestamp } };
      },
      invalidatesTags: ['Attendance'],
    }),
  }),
});

export const {
  useGetAttendanceStatusQuery,
  useCheckInMutation,
  useCheckOutMutation,
} = attendanceSlice;


