import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, App, Tag, Divider, Modal, Input } from 'antd';
import { Clock, LogIn, LogOut, AlertCircle, CheckCircle2, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetAttendanceStatusQuery, useCheckInMutation, useCheckOutMutation } from '@/store/api/attendanceSlice';

const { Title, Text } = Typography;

const LATE_THRESHOLD_HOURS = 9;
const LATE_THRESHOLD_MINUTES = 0;

const AttendanceWidget: React.FC = () => {
  const { notification } = App.useApp();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workedTime, setWorkedTime] = useState('00:00:00');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [remark, setRemark] = useState('');
  
  const { data: attendanceData, isLoading } = useGetAttendanceStatusQuery();
  const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation();
  const [checkOut, { isLoading: isCheckingOut }] = useCheckOutMutation();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      if (attendanceData?.status === 'checked-in' && attendanceData.lastAction) {
        const checkInTime = new Date(attendanceData.lastAction).getTime();
        const diff = now.getTime() - checkInTime;
        
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          
          setWorkedTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [attendanceData]);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const handleCheckIn = async (customRemark?: string) => {
    if (attendanceData?.dbStatus === 'CHECKED_OUT' && !customRemark) {
      setIsModalOpen(true);
      return;
    }

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    const isLate = hours > LATE_THRESHOLD_HOURS || (hours === LATE_THRESHOLD_HOURS && minutes > LATE_THRESHOLD_MINUTES);

    try {
      await checkIn(customRemark ? { remark: customRemark } : {}).unwrap();
      
      if (customRemark) {
        setIsModalOpen(false);
        setRemark('');
      }

      if (isLate) {
        notification.warning({
          message: 'Late Check-in',
          description: `You checked in at ${formatTime(now)}. The official start time is 09:00 AM.`,
          placement: 'topRight',
          icon: <AlertCircle className="text-warning" size={24} />,
        });
      } else {
        notification.success({
          message: 'Success',
          description: 'You have checked in successfully. Have a great day!',
          placement: 'topRight',
          icon: <CheckCircle2 className="text-success" size={24} />,
        });
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to check in. Please try again.',
      });
    }
  };

  const handleCheckOut = async () => {
    try {
      const now = new Date();
      await checkOut().unwrap();
      notification.info({
        message: 'Checked Out',
        description: `You checked out at ${formatTime(now)}. Total worked time: ${workedTime}`,
        placement: 'topRight',
      });
      setWorkedTime('00:00:00');
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to check out. Please try again.',
      });
    }
  };

  const isCheckedIn = attendanceData?.status === 'checked-in';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        className="glass-card overflow-hidden relative group"
        styles={{ body: { padding: '24px' } }}
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Clock size={80} className="text-primary" />
        </div>

        <div className="flex flex-col gap-6 w-full">
          <div className="flex justify-between items-start">
            <div>
              <Title level={4} className="m-0 text-white font-bold tracking-tight">
                Attendance
              </Title>
              <Text className="text-muted text-sm">{formatDate(currentTime)}</Text>
            </div>
            <AnimatePresence mode="wait">
              {isCheckedIn ? (
                <motion.div
                  key="checked-in-tag"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Tag color="cyan" className="m-0 border-none px-3 py-1 bg-cyan-500/20 text-cyan-400 font-semibold rounded-full flex items-center gap-1">
                    <Timer size={14} /> CHECKED IN
                  </Tag>
                </motion.div>
              ) : (
                <motion.div
                  key="checked-out-tag"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Tag className="m-0 border-none px-3 py-1 bg-slate-500/20 text-slate-400 font-semibold rounded-full">
                    NOT IN
                  </Tag>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="text-center py-4 relative">
            <motion.div
              key={currentTime.getSeconds()}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <div 
                className="text-5xl font-extrabold tracking-tight"
                style={{ 
                  background: 'linear-gradient(135deg, #22d3ee, #67e8f9)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {formatTime(currentTime)}
              </div>
            </motion.div>
            <Text className="text-muted uppercase tracking-[0.2em] text-[10px] font-bold">Real-time Clock</Text>
          </div>

          <Divider className="border-border-subtle my-2" />

          {isCheckedIn ? (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm items-center bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/20">
                <span className="text-cyan-400 font-medium flex items-center gap-2"><Timer size={16} /> Tracked Time</span>
                <span className="text-white font-bold tracking-wider">{workedTime}</span>
              </div>
              <Button 
                type="primary" 
                danger 
                size="large" 
                block 
                icon={<LogOut size={18} />}
                onClick={handleCheckOut}
                loading={isCheckingOut}
                className="btn flex items-center justify-center bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all rounded-xl"
                style={{ height: '52px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}
              >
                CHECK OUT
              </Button>
            </div>
          ) : (
            <Button 
              type="primary" 
              size="large" 
              block 
              icon={<LogIn size={18} />}
              onClick={() => handleCheckIn()}
              loading={isCheckingIn || isLoading}
              className="btn btn-primary flex items-center justify-center rounded-xl"
              style={{ height: '52px' }}
            >
              CHECK IN
            </Button>
          )}

          <div className="bg-surface-subtle/30 rounded-lg p-3 border border-border-subtle flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs text-muted">
              <AlertCircle size={14} className="text-blue-400" />
              <span>Shift: 09:00 AM - 06:00 PM</span>
            </div>
            {attendanceData?.lastAction && !isCheckedIn && (
              <div className="text-xs text-muted">
                Last out: {formatTime(new Date(attendanceData.lastAction))}
              </div>
            )}
          </div>
        </div>
      </Card>

      <Modal
        title="Provide Remark for Re-checking In"
        open={isModalOpen}
        onOk={() => handleCheckIn(remark)}
        onCancel={() => { setIsModalOpen(false); setRemark(''); }}
        okButtonProps={{ disabled: !remark.trim() }}
        okText="Confirm Check In"
      >
        <div className="py-4">
          <Typography.Text className="block mb-2 text-muted">Please provide a reason for checking in again (e.g., mistaken checkout).</Typography.Text>
          <Input.TextArea 
            placeholder="Enter remark here..."
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            rows={4}
          />
        </div>
      </Modal>
    </motion.div>
  );
};

export default AttendanceWidget;
