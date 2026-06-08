'use client';

import React from 'react';
import { Card, Table } from 'antd';
import { tableColumns } from '../constants';
import { Task } from '../types';

interface TaskListViewProps {
    tasks: Task[];
    loading: boolean;
}

const TaskListView: React.FC<TaskListViewProps> = ({ tasks, loading }) => {
    return (
        <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
            <Table
                dataSource={tasks}
                columns={tableColumns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                loading={loading}
            />
        </Card>
    );
};

export default TaskListView;
