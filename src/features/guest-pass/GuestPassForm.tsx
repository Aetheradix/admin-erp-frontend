import React from 'react';
import { Form, Input, DatePicker, App, Button } from 'antd';
import { UserPlus, Send, Mail } from 'lucide-react';
import FormModal from '@/components/common/FormModal';
import { useIssuePassMutation } from '@/store/api/guestpassSlice';

interface GuestPassFormProps {
    open: boolean;
    onCancel: () => void;
}

const GuestPassForm: React.FC<GuestPassFormProps> = ({ open, onCancel }) => {
    const [form] = Form.useForm();
    const [issuePass, { isLoading }] = useIssuePassMutation();
    const { message } = App.useApp();

    const handleFinish = async (values: any) => {
        try {
            const payload = {
                ...values,
                visit_date: values.visit_date.format('YYYY-MM-DD')
            };
            await issuePass(payload).unwrap();
            message.success('Clearance protocol initialized: Pass generated.');
            onCancel();
            form.resetFields();
        } catch (error: any) {
            message.error(error.data?.message || 'Access protocol failure: Sync rejected.');
        }
    };

    return (
        <FormModal
            title="Initialize Access Clearance"
            open={open}
            onCancel={onCancel}
            width={500}
        >
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item name="guest_name" label="Visitor Name / ID" rules={[{ required: true, message: 'Identity required for clearance' }]}>
                    <Input prefix={<UserPlus size={16} />} placeholder="Full Name of Guest" className="glass-input h-12" />
                </Form.Item>

                <Form.Item name="guest_email" label="Guest Security Email" rules={[{ type: 'email', message: 'Valid protocol required' }]}>
                    <Input prefix={<Mail size={16} />} placeholder="email@example.com" className="glass-input h-12" />
                </Form.Item>

                <Form.Item name="visit_date" label="Activation Date" rules={[{ required: true }]}>
                    <DatePicker className="w-full h-12 glass-input border-white/10" />
                </Form.Item>

                <Form.Item name="visit_purpose" label="Mission / Purpose of Visit">
                    <Input.TextArea rows={3} placeholder="Provide details for security validation..." className="glass-input" />
                </Form.Item>

                <Button 
                    type="primary" 
                    htmlType="submit" 
                    block 
                    size="large" 
                    loading={isLoading}
                    icon={<Send size={18} />}
                    className="h-14 rounded-2xl font-bold tracking-widest shadow-xl shadow-primary/20 flex items-center gap-2 justify-center mt-4"
                >
                    INITIALIZE PASS
                </Button>
            </Form>
        </FormModal>
    );
};

export default GuestPassForm;
