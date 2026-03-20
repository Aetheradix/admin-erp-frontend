import React from 'react';
import { Form, DatePicker, Select, Input, App } from 'antd';
import FormModal from '@/components/common/FormModal';
import { useCreateLeaveMutation } from '@/store/api/leaveSlice';

const { RangePicker } = DatePicker;

interface LeaveRequestModalProps {
    open: boolean;
    onCancel: () => void;
}

const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({ open, onCancel }) => {
    const [form] = Form.useForm();
    const [createLeave, { isLoading }] = useCreateLeaveMutation();
    const { message } = App.useApp();

    const handleFinish = async (values: any) => {
        try {
            const payload = {
                type: values.type,
                start_date: values.dates[0].format('YYYY-MM-DD'),
                end_date: values.dates[1].format('YYYY-MM-DD'),
                reason: values.reason
            };
            await createLeave(payload).unwrap();
            message.success('Synchronization complete: Request lodged in main-frame.');
            onCancel();
            form.resetFields();
        } catch (error: any) {
            message.error(error.data?.message || 'Protocol failure: Request rejected.');
        }
    };

    return (
        <FormModal
            title="Initialize Schedule Request"
            open={open}
            onCancel={onCancel}
            onOk={() => form.submit()}
            confirmLoading={isLoading}
            width={500}
        >
            <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ type: 'Day Off' }}>
                <Form.Item name="type" label="Protocol Type" rules={[{ required: true }]}>
                    <Select className="custom-select" options={[
                        { value: 'Day Off', label: 'Day Off (Personal Leave)' },
                        { value: 'WFH', label: 'Remote / Work From Home' },
                    ]} />
                </Form.Item>

                <Form.Item name="dates" label="Temporal Range" rules={[{ required: true, message: 'Select your duration' }]}>
                    <RangePicker className="w-full h-12 glass-input border-white/10" />
                </Form.Item>

                <Form.Item name="reason" label="Justification / Context">
                    <Input.TextArea 
                        rows={4} 
                        placeholder="Provide details for manual approval..." 
                        className="glass-input border-white/10 hover:border-primary/50"
                    />
                </Form.Item>
            </Form>
        </FormModal>
    );
};

export default LeaveRequestModal;
