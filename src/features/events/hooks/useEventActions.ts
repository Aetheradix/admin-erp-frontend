import { useDeleteEventMutation } from '@/store/api/eventSlice';
import { message, Modal } from 'antd';

export const useEventActions = () => {
  const [deleteEvent] = useDeleteEventMutation();

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Delete Event',
      content: 'Are you sure you want to delete this event?',
      okText: 'Delete',
      okType: 'danger',
      centered: true,
      className: 'dark-modal',
      onOk: async () => {
        try {
          await deleteEvent(id).unwrap();
          message.success('Event deleted successfully');
        } catch (error) {
          message.error('Failed to delete event');
        }
      }
    });
  };

  return { handleDelete };
};
