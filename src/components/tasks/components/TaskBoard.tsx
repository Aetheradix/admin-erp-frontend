'use client';

import React from 'react';
import { Tag, Avatar } from 'antd';
import { kanbanColumns, priorityColors } from '../constants';
import { Task } from '../types';

interface TaskBoardProps {
    tasks: Task[];
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks }) => {
    return (
        <div className="kanban-board">
            {kanbanColumns.map((col) => {
                const colTasks = tasks.filter((t) => t.status === col.key);
                return (
                    <div className="kanban-column" key={col.key}>
                        <div className="kanban-column-header">
                            <span className="kanban-column-title" style={{ color: col.color }}>{col.title}</span>
                            <span className="kanban-column-count">{colTasks.length}</span>
                        </div>
                        {colTasks.map((task) => (
                            <div className="kanban-card" key={task.id}>
                                <div style={{ marginBottom: 8 }}>
                                    <span style={{ fontWeight: 600, fontSize: 14 }}>{task.title}</span>
                                </div>
                                <Tag style={{ borderRadius: 6, border: 'none', fontSize: 11, marginBottom: 10 }}>
                                    {task.project}
                                </Tag>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Tag color={priorityColors[task.priority]} style={{ borderRadius: 6, border: 'none', fontWeight: 600, fontSize: 11 }}>
                                        {task.priority}
                                    </Tag>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Avatar size={22} style={{ background: 'var(--primary)', fontSize: 9, fontWeight: 700 }}>
                                            {task.assignee.split(' ').map(n => n[0]).join('')}
                                        </Avatar>
                                        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{task.dueDate}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
};

export default TaskBoard;
