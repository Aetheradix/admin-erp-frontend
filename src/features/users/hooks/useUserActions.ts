import { useDeleteUserMutation } from '@/store/api/userSlice';
import { message, Modal } from 'antd';

export const useUserActions = () => {
  const [deleteUser] = useDeleteUserMutation();

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Delete Staff Member',
      content: 'Are you sure you want to remove this staff member?',
      okText: 'Remove',
      okType: 'danger',
      centered: true,
      className: 'dark-modal',
      onOk: async () => {
        try {
          await deleteUser(id).unwrap();
          message.success('Staff member removed successfully');
        } catch (error) {
          message.error('Failed to remove staff member');
        }
      }
    });
  };

  return { handleDelete };
};
