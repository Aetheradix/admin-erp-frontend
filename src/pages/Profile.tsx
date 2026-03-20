import React, { useState } from 'react';
import { Card, Typography, Avatar, Tag, Divider, Row, Col, Button, Form, Input, App, Upload, Space } from 'antd';
import { User, Mail, Shield, Calendar, Clock, Edit2, Save, X, Camera, Briefcase, Fingerprint, Phone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/common/PageHeader';
import { useUpdateProfileMutation } from '@/store/api/authApiSlice';
import type { UploadProps } from 'antd';

const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { message } = App.useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  if (!user) return null;

  const handleUpdate = async (values: any) => {
    try {
      const result = await updateProfile(values).unwrap();
      updateUser(result.user);
      message.success(result.message || 'Profile updated successfully');
      setIsEditing(false);
    } catch (err: any) {
      message.error(err.data?.message || 'Failed to update profile');
    }
  };

  const uploadProps: UploadProps = {
    showUploadList: false,
    beforeUpload: (file) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
      if (!isJpgOrPng) {
        message.error('You can only upload JPG/PNG/WEBP files!');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Image must smaller than 2MB!');
        return false;
      }

      const reader = new FileReader();
      reader.onload = () => {
        handleUpdate({ image_url: reader.result as string });
      };
      reader.readAsDataURL(file);
      return false; // Prevent auto-upload
    },
  };

  return (
    <div className="animate-fade-in pb-12">
      <PageHeader 
        title="My Profile" 
        subtitle="Manage your identity and synchronize your credentials across the system."
      />

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card className="glass-card text-center py-10 relative group border-primary/10 shadow-2xl">
            <div className="relative inline-block mb-8">
              <Avatar 
                size={160} 
                src={user.image_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.username}`}
                className="border-4 border-primary/20 p-1.5 bg-white/5 shadow-2xl transition-all duration-500 group-hover:scale-105"
              />
              <Upload {...uploadProps}>
                <div className="absolute bottom-3 right-3 w-11 h-11 bg-primary rounded-full flex items-center justify-center text-black cursor-pointer shadow-xl hover:scale-110 transition-all border-4 border-[#1a1f2e] group/cam">
                  <Camera size={20} strokeWidth={2.5} className="group-hover/cam:rotate-12 transition-transform" />
                </div>
              </Upload>
            </div>

            <Title level={2} className="text-white mb-2 tracking-tight font-bold">{user.username}</Title>
            <div className="flex justify-center items-center gap-2 mb-6">
              <Shield size={16} className="text-primary" />
              <Text className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">{user.role} Account</Text>
            </div>
            
            <Tag color="cyan" className="rounded-full px-5 py-1.5 border-none bg-cyan-500/10 text-cyan-400 font-bold text-[10px] tracking-widest">
              IDENTITY VERIFIED
            </Tag>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card className="glass-card h-full">
            <div className="flex justify-between items-center mb-10">
              <Title level={4} className="text-white m-0 flex items-center gap-3">
                <User size={24} className="text-primary" />
                Account Details
              </Title>
              
              {!isEditing ? (
                <Button 
                  type="primary"
                  icon={<Edit2 size={16} />} 
                  className="rounded-xl px-6 flex items-center gap-2 h-10 shadow-lg shadow-primary/20"
                  onClick={() => {
                    form.setFieldsValue(user);
                    setIsEditing(true);
                  }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Space>
                  <Button 
                    danger 
                    type="text" 
                    icon={<X size={18} />} 
                    className="flex items-center text-red-400 hover:bg-red-400/10"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<Save size={18} />} 
                    loading={isUpdating}
                    className="flex items-center rounded-xl px-6 h-10"
                    onClick={() => form.submit()}
                  >
                    Save
                  </Button>
                </Space>
              )}
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdate}
              requiredMark={false}
              className="mt-4"
            >
              <div className="space-y-6">
                <ProfileItem 
                  icon={User} 
                  label="Login Username" 
                  name="username"
                  isEditing={isEditing}
                  value={user.username}
                  rules={[{ required: true, message: 'Username is mandatory' }]}
                />
                
                <ProfileItem 
                  icon={Mail} 
                  label="Email Authentication" 
                  name="email"
                  isEditing={isEditing}
                  value={user.email}
                  rules={[{ required: true, type: 'email' as const, message: 'Valid email is required' }]}
                />

                <ProfileItem 
                  icon={Briefcase} 
                  label="Designation / Role" 
                  name="designation"
                  isEditing={isEditing}
                  value={user.designation || 'Not Set'}
                  placeholder="e.g. Senior Software Engineer"
                />

                <ProfileItem 
                  icon={Fingerprint} 
                  label="Employee Identifier" 
                  name="employee_id"
                  isEditing={isEditing}
                  value={user.employee_id || 'Not Set'}
                  placeholder="e.g. EMP-2024-001"
                />

                <ProfileItem 
                  icon={Phone} 
                  label="Contact Protocol" 
                  name="contact_no"
                  isEditing={isEditing}
                  value={user.contact_no || 'Not Set'}
                  placeholder="+91 XXXXX XXXXX"
                />

                <div className="flex items-start gap-6 bg-white/[0.02] p-6 rounded-3xl border border-white/5 opacity-80 decoration-slate-400">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-white/5 flex items-center justify-center text-primary/50">
                    <Shield size={24} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <Text className="text-muted font-bold text-[10px] uppercase tracking-[0.2em] mb-1 block">Security Role</Text>
                    <Text className="text-white/60 text-lg font-bold block capitalize tracking-tight">{user.role}</Text>
                    <Text className="text-muted/40 text-[11px] mt-1 block">Your access level is governed by system policy.</Text>
                  </div>
                </div>
              </div>
            </Form>

            <Divider className="border-white/5 my-10" />

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-white/[0.01] border border-white/5 flex items-center gap-4 transition-all hover:bg-white/[0.03]">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <Calendar size={20} />
                </div>
                <div>
                  <Text className="text-muted text-[10px] block uppercase font-black tracking-widest mb-1 opacity-50">Member Since</Text>
                  <Text className="text-white/80 font-semibold">March 2026</Text>
                </div>
              </div>
              <div className="p-6 rounded-3xl bg-white/[0.01] border border-white/5 flex items-center gap-4 transition-all hover:bg-white/[0.03]">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <Clock size={20} />
                </div>
                <div>
                  <Text className="text-muted text-[10px] block uppercase font-black tracking-widest mb-1 opacity-50">Last Login</Text>
                  <Text className="text-white/80 font-semibold">Just Now</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const ProfileItem: React.FC<{ 
  icon: any, 
  label: string, 
  name: string,
  value: string,
  isEditing: boolean,
  rules?: any[],
  placeholder?: string
}> = ({ icon: Icon, label, name, value, isEditing, rules, placeholder }) => (
  <div className={`flex items-start gap-6 bg-white/[0.02] p-6 rounded-3xl border transition-all duration-300 ${isEditing ? 'border-primary/30 bg-primary/5' : 'border-white/5'}`}>
    <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-colors duration-300 ${isEditing ? 'bg-primary text-black' : 'bg-white/5 text-primary'}`}>
      <Icon size={24} strokeWidth={isEditing ? 2.5 : 1.5} />
    </div>
    <div className="flex-1">
      <Text className={`font-bold text-[10px] uppercase tracking-[0.2em] mb-1 block transition-colors ${isEditing ? 'text-primary' : 'text-muted'}`}>{label}</Text>
      
      {isEditing ? (
        <Form.Item name={name} rules={rules} className="m-0 pt-1">
          <Input 
            className="glass-input h-10 border-none px-0 text-white font-bold text-lg hover:bg-transparent focus:bg-transparent" 
            autoFocus={name === 'username'}
            placeholder={placeholder}
          />
        </Form.Item>
      ) : (
        <>
          <Text className="text-white text-lg font-bold block tracking-tight">{value}</Text>
          <Text className="text-muted/40 text-[11px] mt-1 block">Primary credential for system access.</Text>
        </>
      )}
    </div>
  </div>
);

export default Profile;
