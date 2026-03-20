import { Form, Input, InputNumber, Select, App, Button } from 'antd';
import { Upload as UploadIcon, IndianRupee } from 'lucide-react';
import FormModal from '@/components/common/FormModal';
import { useCreateReimbursementMutation } from '@/store/api/reimbursementSlice';

interface ReimbursementFormProps {
    open: boolean;
    onCancel: () => void;
}

const ReimbursementForm: React.FC<ReimbursementFormProps> = ({ open, onCancel }) => {
    const [form] = Form.useForm();
    const [createClaim, { isLoading }] = useCreateReimbursementMutation();
    const { message } = App.useApp();

    const handleFinish = async (values: any) => {
        try {
            await createClaim(values).unwrap();
            message.success('Synchronization complete: Fiscal claim lodged.');
            onCancel();
            form.resetFields();
        } catch (error: any) {
            message.error(error.data?.message || 'Protocol failure: Request rejected.');
        }
    };

    return (
        <FormModal
            title="Initialize Financial Claim"
            open={open}
            onCancel={onCancel}
            width={550}
        >
            <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ category: 'Travel' }}>
                <div className="grid grid-cols-2 gap-6">
                    <Form.Item name="title" label="Claim Title" rules={[{ required: true, message: 'Identity check failed: Title required' }]}>
                        <Input placeholder="e.g. Client Dinner" className="glass-input h-12" />
                    </Form.Item>

                    <Form.Item name="amount" label="Scalar Amount (INR)" rules={[{ required: true }]}>
                        <InputNumber 
                            className="w-full h-12 glass-input-number" 
                            prefix={<IndianRupee size={16} />}
                            min={1}
                        />
                    </Form.Item>
                </div>

                <Form.Item name="category" label="Fiscal Category" rules={[{ required: true }]}>
                    <Select className="custom-select" options={[
                        { value: 'Travel', label: 'Travel & Commute' },
                        { value: 'Equipment', label: 'Hardware/Software Acquisition' },
                        { value: 'Meals', label: 'Food & Entertainment' },
                        { value: 'Other', label: 'Miscellaneous' },
                    ]} />
                </Form.Item>

                <Form.Item name="description" label="Justification / Context">
                    <Input.TextArea rows={3} placeholder="Provide details for manual validation..." className="glass-input" />
                </Form.Item>

                <Form.Item name="receipt_url" label="Supportive Documentation (Image URL)">
                    <Input prefix={<UploadIcon size={16} />} placeholder="https://image-host.com/receipt.jpg" className="glass-input h-12" />
                </Form.Item>

                <Button 
                    type="primary" 
                    htmlType="submit" 
                    block 
                    size="large" 
                    loading={isLoading}
                    className="h-14 rounded-2xl font-bold tracking-widest shadow-xl shadow-primary/20 mt-4"
                >
                    COMMIT CLAIM
                </Button>
            </Form>
        </FormModal>
    );
};

export default ReimbursementForm;
