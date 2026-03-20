import React, { useEffect, useState } from 'react';
import { Form, Upload, Select } from 'antd';
import { UploadCloud } from 'lucide-react';
import FormModal from '@/components/common/FormModal';
import FormInput from '@/components/common/FormInput';
import PrimaryButton from '@/components/common/PrimaryButton';

const { Dragger } = Upload;

interface GalleryUploadProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialValues?: any;
}

const GalleryUpload: React.FC<GalleryUploadProps> = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
        setFileList([]);
      }
    }
  }, [open, initialValues, form]);

  const handleFinish = (values: any) => {
    onSubmit({ ...values, files: fileList });
  };

  return (
    <FormModal
      title={initialValues ? "Modify Asset Metadata" : "Initialize Media Ingestion"}
      open={open}
      onCancel={onCancel}
      width={650}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={initialValues}
      >
        <Form.Item
          name="category"
          label={<span className="text-gray-300 font-medium text-sm">Security Classification / Category</span>}
          rules={[{ required: true, message: 'Classification required' }]}
        >
          <Select 
            placeholder="Select category"
            className="h-12 w-full custom-select"
            options={[
              { value: 'events', label: 'Events & Coordination' },
              { value: 'office', label: 'Office Infrastructure' },
              { value: 'team', label: 'Human Resources' },
            ]}
          />
        </Form.Item>

        <FormInput 
          name="title" 
          label="Asset Identifier (Title)" 
          placeholder="Corporate setup v1..." 
        />

        {!initialValues && (
          <Form.Item label={<span className="text-gray-300 font-medium text-sm">Target Media Nodes</span>}>
             <Dragger 
                name="file"
                multiple 
                onChange={(info) => setFileList(info.fileList)}
                className="bg-[#0f172a] border-white/10! hover:border-cyan-500/50! hover:bg-white/5! transition-all rounded-3xl p-10 group"
             >
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-cyan-500/10 rounded-full text-cyan-400 group-hover:scale-110 transition-transform">
                  <UploadCloud size={32} />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">Initialize Batch Ingestion</p>
                  <p className="text-white/40 text-xs mt-1 lowercase tracking-wider italic">Supports high-resolution PNG, JPG up to 10MB</p>
                </div>
              </div>
            </Dragger>
          </Form.Item>
        )}

        <div className="flex justify-end gap-3 mt-10">
          <PrimaryButton onClick={onCancel} className="w-fit! px-8 bg-transparent! text-white! border border-white/10 hover:border-white/30!">
            Halt
          </PrimaryButton>
          <PrimaryButton htmlType="submit" className="w-fit! px-12">
            {initialValues ? "Confirm Overwrite" : "Begin Upload"}
          </PrimaryButton>
        </div>
      </Form>
    </FormModal>
  );
};

export default GalleryUpload;
