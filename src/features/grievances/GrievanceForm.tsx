import { Form, Input, Switch, App, Button, Typography } from 'antd';
import { EyeOff, Send } from 'lucide-react';
import FormModal from '@/components/common/FormModal';
import { useSubmitGrievanceMutation } from '@/store/api/grievanceSlice';

const { Text } = Typography;

interface GrievanceFormProps {
    open: boolean;
    onCancel: () => void;
}

const GrievanceForm: React.FC<GrievanceFormProps> = ({ open, onCancel }) => {
    const [form] = Form.useForm();
    const [submitGrievance, { isLoading }] = useSubmitGrievanceMutation();
    const { message } = App.useApp();

    const handleFinish = async (values: any) => {
        try {
            await submitGrievance(values).unwrap();
            message.success('Synchronization complete: Grievance logged in secure-vault.');
            onCancel();
            form.resetFields();
        } catch (error: any) {
            message.error(error.data?.message || 'Protocol failure: Transmission sync failed.');
        }
    };

    return (
        <FormModal
            title="Initialize Grievance Protocol"
            open={open}
            onCancel={onCancel}
            width={550}
        >
            <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ is_anonymous: false }}>
                <Form.Item name="subject" label="Subject Header" rules={[{ required: true, message: 'Identity check failed: Subject required' }]}>
                    <Input placeholder="e.g. Workplace Conduct / Equipment Failure" className="glass-input h-12" />
                </Form.Item>

                <Form.Item name="description" label="Detailed Context / Narrative" rules={[{ required: true }]}>
                    <Input.TextArea rows={5} placeholder="Provide comprehensive details for HR validation..." className="glass-input" />
                </Form.Item>

                <div className="flex items-center justify-between bg-white/5 p-6 rounded-3xl border border-white/5 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                            <EyeOff size={20} />
                        </div>
                        <div>
                            <Text className="text-white font-bold block">Anonymous Submission</Text>
                            <Text className="text-white/30 text-[10px] uppercase tracking-widest font-black">Hide your identity from the system</Text>
                        </div>
                    </div>
                    <Form.Item name="is_anonymous" valuePropName="checked" className="m-0">
                        <Switch className="custom-switch" />
                    </Form.Item>
                </div>

                <Button 
                    type="primary" 
                    htmlType="submit" 
                    block 
                    size="large" 
                    loading={isLoading}
                    icon={<Send size={18} />}
                    className="h-14 rounded-2xl font-bold tracking-widest shadow-xl shadow-primary/20 flex items-center gap-2 justify-center"
                >
                    TRANSMIT SECURELY
                </Button>
            </Form>
        </FormModal>
    );
};

export default GrievanceForm;
