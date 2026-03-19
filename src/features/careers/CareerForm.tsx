import React, { useEffect } from 'react';
import { Form, Input, Button, Select, InputNumber } from 'antd';
import FormModal from '@/components/common/FormModal';

interface CareerFormProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialValues?: any;
}

const CareerForm: React.FC<CareerFormProps> = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  const handleFinish = (values: any) => {
    onSubmit(values);
  };

  return (
    <FormModal
      title={initialValues ? "Edit Career Post" : "Create New Career Post"}
      open={open}
      onCancel={onCancel}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="text-white"
        initialValues={{ type: 'Full-time' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="role"
            label={<span className="text-white/80">Job Role/Title</span>}
            rules={[{ required: true, message: 'Please enter job role' }]}
          >
            <Input 
              placeholder="e.g. Senior UX Designer" 
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-10 rounded-lg hover:border-white/30 focus:border-[#d4ff3f] focus:bg-white/10 transition-all"
            />
          </Form.Item>

          <Form.Item
            name="dept"
            label={<span className="text-white/80">Department</span>}
            rules={[{ required: true, message: 'Please enter department' }]}
          >
            <Input 
              placeholder="e.g. Design, Engineering" 
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-10 rounded-lg hover:border-white/30 focus:border-[#d4ff3f] focus:bg-white/10 transition-all"
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="type"
            label={<span className="text-white/80">Job Type</span>}
            rules={[{ required: true, message: 'Please select job type' }]}
          >
            <Select 
              className="custom-select"
              options={[
                { value: 'Full-time', label: 'Full-time' },
                { value: 'Part-time', label: 'Part-time' },
                { value: 'Contract', label: 'Contract' },
                { value: 'Freelance', label: 'Freelance' },
              ]}
              dropdownStyle={{ backgroundColor: '#1b212f' }}
            />
          </Form.Item>

          <Form.Item
            name="location"
            label={<span className="text-white/80">Location</span>}
            rules={[{ required: true, message: 'Please enter location' }]}
          >
            <Input 
              placeholder="e.g. Remote, NYC, San Francisco" 
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-10 rounded-lg hover:border-white/30 focus:border-[#d4ff3f] focus:bg-white/10 transition-all"
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="salary"
            label={<span className="text-white/80">Salary Range</span>}
            rules={[{ required: true, message: 'Please enter salary range' }]}
          >
            <Input 
              placeholder="e.g. $120k - $160k" 
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-10 rounded-lg hover:border-white/30 focus:border-[#d4ff3f] focus:bg-white/10 transition-all"
            />
          </Form.Item>

          <Form.Item
            name="applicants"
            label={<span className="text-white/80">Initial Applicants (Optional)</span>}
          >
            <InputNumber 
              min={0}
              className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/30 h-10 rounded-lg hover:border-white/30 focus:border-[#d4ff3f] focus:bg-white/10 transition-all"
              placeholder="0"
            />
          </Form.Item>
        </div>

        <Form.Item
          name="description"
          label={<span className="text-white/80">Job Description</span>}
        >
          <Input.TextArea 
            rows={4}
            placeholder="Briefly describe the role..." 
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-lg hover:border-white/30 focus:border-[#d4ff3f] focus:bg-white/10 transition-all"
          />
        </Form.Item>

        <div className="flex justify-end gap-3 mt-8">
          <Button onClick={onCancel} className="border-white/10! text-white! hover:border-white/30! hover:text-white!">
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" className="font-semibold px-6 hover:opacity-90 transition-opacity">
            {initialValues ? "Update" : "Create"}
          </Button>
        </div>
      </Form>
    </FormModal>
  );
};

export default CareerForm;
