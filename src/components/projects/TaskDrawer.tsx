import React, { useState } from 'react';
import {
  Drawer,
  Space,
  Select,
  Input,
  Button,
  Tabs,
  Timeline,
  Descriptions,
  message,
  Popconfirm,
  Tag,
  Divider,
} from 'antd';
import {
  Calendar,
  Building2,
  ShieldCheck,
  UserCheck,
  Trash2,
  Send,
  User,
  Clock,
} from 'lucide-react';
import { StatusTag } from './StatusTag';
import { PriorityTag } from './PriorityTag';
import { EmployeeSelector } from './EmployeeSelector';
import { projectService } from '@/services/projectService';
import { departmentService } from '@/services/departmentService';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateTaskRealMutation, useReassignTaskMutation } from '@/store/api/projectApiSlice';
import type { ProjectTask } from '@/types/project';

const { TextArea } = Input;

interface TaskDrawerProps {
  task: ProjectTask | null;
  open: boolean;
  onClose: () => void;
  onTaskUpdated?: () => void;
}

export const TaskDrawer: React.FC<TaskDrawerProps> = ({
  task,
  open,
  onClose,
  onTaskUpdated,
}) => {
  const { user } = useAuth();
  const [updateTaskMutation] = useUpdateTaskRealMutation();
  const [reassignTaskMutation] = useReassignTaskMutation();

  const [activeTab, setActiveTab] = useState('details');
  const [newComment, setNewComment] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState('');

  if (!task) return null;

  const currentStatus = task.status;
  const currentPriority = task.priority;

  const handleStatusChange = async (newStatus: string) => {
    try {
      projectService.saveTask({ id: task.id, status: newStatus });
      // Sync to backend
      const backendStatus =
        newStatus === 'Done' ? 'Completed' : newStatus === 'In Progress' ? 'On-Going' : 'Pending';
      await updateTaskMutation({ id: task.id, data: { task_status: backendStatus } }).unwrap();
    } catch {
      // offline fallback
    }
    message.success(`Status updated to "${newStatus}"`);
    if (onTaskUpdated) onTaskUpdated();
  };

  const handlePriorityChange = async (newPriority: 'High' | 'Medium' | 'Low') => {
    try {
      projectService.saveTask({ id: task.id, priority: newPriority });
      await updateTaskMutation({ id: task.id, data: { priority: newPriority } }).unwrap();
    } catch {
      // offline fallback
    }
    message.success(`Priority updated to "${newPriority}"`);
    if (onTaskUpdated) onTaskUpdated();
  };

  const handleAssigneeChange = async (newUserId: number) => {
    const emp = departmentService.getEmployeeById(newUserId);
    if (!emp) return;

    try {
      projectService.reassignTask(
        task.id,
        emp.userId,
        emp.userName,
        user?.id || 1,
        user?.username || 'Current User',
        'Reassigned from Task Drawer'
      );
      await reassignTaskMutation({
        id: task.id,
        new_user_id: emp.userId,
        new_manager_id: emp.reportingManagerId,
      }).unwrap();
      message.success(`Task reassigned to ${emp.userName}`);
    } catch {
      message.success(`Task reassigned to ${emp.userName} (local)`);
    }
    if (onTaskUpdated) onTaskUpdated();
  };

  const handleSaveTitle = () => {
    if (titleValue.trim() && titleValue.trim() !== task.title) {
      projectService.saveTask({ id: task.id, title: titleValue.trim() });
      message.success('Title updated');
      if (onTaskUpdated) onTaskUpdated();
    }
    setEditingTitle(false);
  };

  const handleSaveDesc = () => {
    projectService.saveTask({ id: task.id, description: descValue });
    message.success('Description updated');
    setEditingDesc(false);
    if (onTaskUpdated) onTaskUpdated();
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const authorName = user?.username || 'Team Member';
    const comments = task.comments || [];
    const updated = [
      ...comments,
      {
        id: Date.now(),
        taskId: task.id,
        userId: user?.id ? Number(user.id) : 1,
        userName: authorName,
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
      },
    ];
    projectService.saveTask({ id: task.id, comments: updated });
    setNewComment('');
    message.success('Comment added');
    if (onTaskUpdated) onTaskUpdated();
  };

  const handleDeleteTask = () => {
    projectService.deleteTask(task.id);
    message.success('Task deleted');
    onClose();
    if (onTaskUpdated) onTaskUpdated();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={640}
      destroyOnClose
      styles={{
        header: { padding: '16px 24px', borderBottom: '1px solid var(--border-subtle, #f0f0f0)' },
        body: { padding: '24px' },
      }}
      title={
        <div className="flex items-center justify-between gap-4 w-full pr-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
              TSK-{task.id}
            </span>
            <StatusTag status={currentStatus} />
          </div>

          <Space size={8}>
            <Select
              size="small"
              value={currentStatus}
              onChange={handleStatusChange}
              className="w-32"
              options={[
                { value: 'To Do', label: 'To Do' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'In Review', label: 'In Review' },
                { value: 'Done', label: 'Done' },
              ]}
            />
            <Select
              size="small"
              value={currentPriority}
              onChange={handlePriorityChange}
              className="w-28"
              options={[
                { value: 'High', label: 'High' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Low', label: 'Low' },
              ]}
            />
          </Space>
        </div>
      }
      extra={
        <Popconfirm
          title="Delete Task"
          description="Are you sure you want to delete this task?"
          onConfirm={handleDeleteTask}
          okText="Delete"
          okButtonProps={{ danger: true }}>
          <Button type="text" danger icon={<Trash2 size={16} />} title="Delete Task" />
        </Popconfirm>
      }>
      {/* Task Title (Editable) */}
      <div className="mb-6">
        {editingTitle ? (
          <Input
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleSaveTitle}
            onPressEnter={handleSaveTitle}
            autoFocus
            className="text-lg font-bold"
          />
        ) : (
          <h2
            onClick={() => {
              setTitleValue(task.title);
              setEditingTitle(true);
            }}
            className="text-lg font-black text-foreground cursor-pointer hover:text-primary transition-colors flex items-center gap-2"
            title="Click to edit title">
            {task.title}
          </h2>
        )}
      </div>

      {/* Tabs: Details, Comments, Audit */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'details',
            label: 'Details',
            children: (
              <div className="space-y-6 pt-2">
                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-muted uppercase tracking-wider">
                      Description
                    </span>
                    {!editingDesc && (
                      <Button
                        type="link"
                        size="small"
                        onClick={() => {
                          setDescValue(task.description || '');
                          setEditingDesc(true);
                        }}>
                        Edit
                      </Button>
                    )}
                  </div>
                  {editingDesc ? (
                    <div>
                      <TextArea
                        rows={4}
                        value={descValue}
                        onChange={(e) => setDescValue(e.target.value)}
                        placeholder="Add a detailed description..."
                        className="rounded-xl"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <Button size="small" onClick={() => setEditingDesc(false)}>
                          Cancel
                        </Button>
                        <Button size="small" type="primary" onClick={handleSaveDesc}>
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setDescValue(task.description || '');
                        setEditingDesc(true);
                      }}
                      className="p-3 rounded-xl bg-surface-subtle text-xs text-foreground min-h-[60px] cursor-pointer hover:bg-surface-elevated transition-colors whitespace-pre-wrap">
                      {task.description || (
                        <span className="text-muted italic">Click to add description...</span>
                      )}
                    </div>
                  )}
                </div>

                <Divider className="my-2" />

                {/* Ownership & Reporting Hierarchy Chain */}
                <div>
                  <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-3">
                    Assignment &amp; Reporting Structure
                  </span>
                  <div className="p-4 rounded-xl border border-border-subtle bg-surface-subtle space-y-3">
                    {/* Primary Assignee */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted flex items-center gap-1.5">
                        <User size={13} className="text-primary" /> Assignee:
                      </span>
                      <div className="w-56">
                        <EmployeeSelector
                          value={task.assignedToId}
                          onChange={handleAssigneeChange}
                          placeholder={task.assignedToName || 'Select Assignee'}
                          size="small"
                        />
                      </div>
                    </div>

                    {/* Reporting Manager */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted flex items-center gap-1.5">
                        <ShieldCheck size={13} className="text-primary" /> Reporting Manager:
                      </span>
                      <span className="font-semibold text-foreground">
                        {task.reportingManagerName || 'Auto-identified on assignment'}
                      </span>
                    </div>

                    {/* Department Head */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted flex items-center gap-1.5">
                        <UserCheck size={13} className="text-primary" /> Department Head:
                      </span>
                      <span className="font-semibold text-foreground">
                        {task.deptHeadName || 'Auto-identified from department'}
                      </span>
                    </div>

                    {/* Department */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted flex items-center gap-1.5">
                        <Building2 size={13} className="text-primary" /> Department:
                      </span>
                      <Tag color="blue" className="m-0 text-xs">
                        {task.departmentName || 'General'}
                      </Tag>
                    </div>
                  </div>
                </div>

                <Divider className="my-2" />

                {/* Dates & Schedule */}
                <Descriptions column={2} size="small" bordered>
                  <Descriptions.Item label="Start Date">
                    <span className="text-xs flex items-center gap-1">
                      <Calendar size={12} className="text-muted" />
                      {task.startDate || 'Not specified'}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Due Date">
                    <span className="text-xs flex items-center gap-1 font-semibold text-primary">
                      <Clock size={12} />
                      {task.dueDate || 'No due date'}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Priority">
                    <PriorityTag priority={task.priority} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <StatusTag status={task.status} />
                  </Descriptions.Item>
                </Descriptions>
              </div>
            ),
          },
          {
            key: 'comments',
            label: `Comments (${task.comments?.length || 0})`,
            children: (
              <div className="space-y-4 pt-2">
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {task.comments && task.comments.length > 0 ? (
                    task.comments.map((c) => (
                      <div key={c.id} className="p-3 rounded-xl bg-surface-subtle text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-foreground">{c.userName}</span>
                          <span className="text-[10px] text-muted">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-muted-foreground whitespace-pre-wrap">{c.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-muted">
                      No comments yet. Start the conversation below.
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <TextArea
                    rows={2}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="rounded-xl text-xs"
                    onPressEnter={(e) => {
                      if (!e.shiftKey) {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                  />
                  <Button
                    type="primary"
                    icon={<Send size={14} />}
                    onClick={handleAddComment}
                    className="h-auto px-4 rounded-xl"
                  />
                </div>
              </div>
            ),
          },
          {
            key: 'activity',
            label: 'Activity History',
            children: (
              <div className="pt-2">
                {task.assignmentHistory && task.assignmentHistory.length > 0 ? (
                  <Timeline
                    items={task.assignmentHistory.map((h) => ({
                      color: 'blue',
                      children: (
                        <div className="text-xs">
                          <div className="font-bold text-foreground">
                            Reassigned to {h.toUserName}
                          </div>
                          <div className="text-muted">
                            by {h.reassignedByName} · {new Date(h.timestamp).toLocaleDateString()}
                          </div>
                          {h.reason && (
                            <div className="text-[11px] text-primary italic mt-0.5">
                              "{h.reason}"
                            </div>
                          )}
                        </div>
                      ),
                    }))}
                  />
                ) : (
                  <div className="text-center py-8 text-xs text-muted">
                    No reassignment history recorded for this task.
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
    </Drawer>
  );
};
