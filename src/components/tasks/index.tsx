'use client';

import React from 'react';
import { Button, Segmented, Input, Space } from 'antd';
import { PlusOutlined, AppstoreOutlined, BarsOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { PageHeader, AppContainer } from '@/src/components/ui';
import { useTasks } from './hooks/useTasks';
import TaskModal from './components/TaskModal';
import TaskBoard from './components/TaskBoard';
import TaskListView from './components/TaskListView';

export default function Tasks() {
  const { tasks, totalTasks, loading, search, setSearch, view, setView, addTask } = useTasks();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <AppContainer fluid>
      <PageHeader
        title="Tasks"
        subtitle={`${totalTasks} tasks assigned.`}
        breadcrumbs={[{ title: 'Tasks' }]}
        actions={
          <Space>
            <Button icon={<DownloadOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>
              Export
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              style={{ borderRadius: 10, fontWeight: 600 }}
              onClick={() => setIsModalOpen(true)}
            >
              New Task
            </Button>
          </Space>
        }
      />

      <TaskModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={addTask}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Input
          prefix={<SearchOutlined style={{ color: 'var(--muted)' }} />}
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 320, borderRadius: 10 }}
          allowClear
        />
        <Segmented
          value={view}
          onChange={(v) => setView(v as string)}
          options={[
            { value: 'kanban', label: 'Board', icon: <AppstoreOutlined /> },
            { value: 'list', label: 'List', icon: <BarsOutlined /> }
          ]}
        />
      </div>

      {view === 'kanban' ? (
        <TaskBoard tasks={tasks} />
      ) : (
        <TaskListView tasks={tasks} loading={loading} />
      )}
    </AppContainer>
  );
}
