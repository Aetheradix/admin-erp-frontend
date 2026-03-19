import { useState } from 'react';
import { Briefcase, Clock, DollarSign, MapPin, MoreVertical, Plus, Edit, Trash2 } from 'lucide-react';
import { Dropdown, Modal, message, Spin } from 'antd';
import { useGetCareersQuery, useCreateCareerMutation, useUpdateCareerMutation, useDeleteCareerMutation } from '@/store/api/careerSlice';
import CareerForm from './CareerForm';

export default function CareersList() {
  const { data: jobs = [], isLoading, isError } = useGetCareersQuery();
  const [createCareer] = useCreateCareerMutation();
  const [updateCareer] = useUpdateCareerMutation();
  const [deleteCareer] = useDeleteCareerMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);

  const handleCreateJob = () => {
    setEditingJob(null);
    setIsFormOpen(true);
  };

  const handleEditJob = (job: any) => {
    setEditingJob(job);
    setIsFormOpen(true);
  };

  const handleDeleteJob = (job: any) => {
    Modal.confirm({
      title: 'Delete Career Post',
      content: `Are you sure you want to delete the ${job.role} position?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteCareer(job.id || job.key).unwrap();
          message.success('Job posting deleted successfully');
        } catch (error) {
          message.error('Failed to delete job posting');
        }
      },
      centered: true,
      className: 'dark-modal',
    });
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (editingJob) {
        await updateCareer({ ...editingJob, ...values }).unwrap();
        message.success('Job posting updated successfully');
      } else {
        await createCareer({ ...values, applicants: values.applicants || 0 }).unwrap();
        message.success('New job posting created successfully');
      }
      setIsFormOpen(false);
    } catch (error) {
      message.error('Failed to save job posting');
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 w-full flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-white">
        <p>Error loading careers. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Careers & Talent</h1>
          <p className="text-white/40 text-sm font-medium">Manage job postings and review inbound talent applications.</p>
        </div>
        <button 
          onClick={handleCreateJob}
          className="bg-white hover:bg-[#d4ff3f] text-black px-8 py-4 rounded-full transition-all duration-300 font-black uppercase text-xs tracking-widest shadow-xl shadow-white/5 flex items-center gap-2"
        >
          <Plus size={18} />
          Post New Job
        </button>
      </div>

      <div className="space-y-4">
        {jobs.map((job: any) => (
          <div key={job.id || job.key} className="bg-[#1b212f]/40 border border-white/5 rounded-4xl p-6 lg:p-8 flex flex-col lg:flex-row items-center gap-8 group hover:bg-[#1b212f] hover:border-white/10 transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-[#d4ff3f] group-hover:text-black transition-all">
              <Briefcase size={28} />
            </div>

            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-xl font-bold text-white mb-2">{job.role}</h3>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-white/40 text-xs font-medium uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><MapPin size={14} /> {job.location}</span>
                <span className="flex items-center gap-1.5"><Clock size={14} /> {job.type}</span>
                <span className="flex items-center gap-1.5 text-[#d4ff3f]/60"><DollarSign size={14} /> {job.salary}</span>
              </div>
            </div>

            <div className="flex items-center gap-12">
              <div className="text-center hidden sm:block">
                <div className="text-xl font-bold text-white">{job.applicants}</div>
                <div className="text-[10px] text-white/30 uppercase font-black tracking-widest">Applicants</div>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white text-white hover:text-black text-xs font-bold transition-all uppercase tracking-widest border border-white/10">View Leads</button>
                
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'edit',
                        label: 'Edit',
                        icon: <Edit size={14} />,
                        onClick: () => handleEditJob(job),
                      },
                      {
                        key: 'delete',
                        label: 'Delete',
                        danger: true,
                        icon: <Trash2 size={14} />,
                        onClick: () => handleDeleteJob(job),
                      },
                    ],
                    className: 'dark-dropdown',
                  }}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all">
                    <MoreVertical size={18} />
                  </button>
                </Dropdown>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CareerForm 
        open={isFormOpen}
        onCancel={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialValues={editingJob}
      />
    </div>
  );
}
