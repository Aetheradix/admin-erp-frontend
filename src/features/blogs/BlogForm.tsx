import React, { useEffect } from 'react';
import { Form, Switch, Upload } from 'antd';
import { UploadCloud } from 'lucide-react';
import FormModal from '@/components/common/FormModal';
import FormInput from '@/components/common/FormInput';
import PrimaryButton from '@/components/common/PrimaryButton';

interface BlogFormProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialValues?: any;
}

const BlogForm: React.FC<BlogFormProps> = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          isPublished: initialValues.status === 'Published'
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  return (
    <FormModal
      title={initialValues ? "Edit Blog Entry" : "Create New Blog Entry"}
      open={open}
      onCancel={onCancel}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{ isPublished: false }}
      >
        <FormInput 
          name="title" 
          label="Blog Title" 
          placeholder="System architecture in 2024..." 
          rules={[{ required: true, message: 'Title is mandatory' }]} 
        />

        <FormInput 
          name="category" 
          label="Category" 
          placeholder="e.g., Technology, Design" 
          rules={[{ required: true, message: 'Category is mandatory' }]} 
        />

        <Form.Item
          name="content"
          label={<span className="text-gray-300 font-medium text-sm">Content</span>}
          rules={[{ required: true, message: 'Content cannot be empty' }]}
        >
          <textarea 
            rows={8}
            className="w-full bg-[#0f172a] border border-white/10 text-white p-4 rounded-xl focus:border-cyan-500 outline-none transition-all placeholder:text-gray-600"
            placeholder="Write your metadata here..." 
          />
        </Form.Item>

        <Form.Item
          name="image"
          label={<span className="text-gray-300 font-medium text-sm">Cover Image</span>}
        >
          <Upload name="logo" action="/upload.do" listType="picture">
            <PrimaryButton className="bg-[#1b212f]! text-white! border border-white/10 hover:border-cyan-500/50!">
              <UploadCloud size={18} className="mr-2" /> Upload Assets
            </PrimaryButton>
          </Upload>
        </Form.Item>

        <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl mb-8">
          <span className="text-sm font-medium text-gray-300">Authorize Immediate Publication</span>
          <Form.Item name="isPublished" valuePropName="checked" noStyle>
            <Switch />
          </Form.Item>
        </div>

        <div className="flex justify-end gap-3">
          <PrimaryButton onClick={onCancel} className="w-fit! px-8 bg-transparent! text-white! border border-white/10 hover:border-white/30!">
            Cancel
          </PrimaryButton>
          <PrimaryButton htmlType="submit" className="w-fit! px-12">
            {initialValues ? "Update Node" : "Initialize Blog"}
          </PrimaryButton>
        </div>
      </Form>
    </FormModal>
  );
};

export default BlogForm;
