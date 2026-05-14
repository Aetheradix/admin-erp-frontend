'use client';

import React from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Timeline,
  Tag,
  List,
  Progress,
  Button,
} from 'antd';
import {
  ArrowRightOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import PageHeader from '@/src/components/ui/PageHeader';
import StatCard from '@/src/components/ui/StatCard';
import { useDashboard } from './hooks/useDashboard';

const { Text } = Typography;

const recentActivity = [
  {
    color: '#E8583A',
    children: (
      <>
        <Text strong style={{ fontSize: 13 }}>Sarah Chen</Text>{' '}
        <Text style={{ color: 'var(--muted)', fontSize: 13 }}>completed task</Text>{' '}
        <Tag color="green" style={{ borderRadius: 6, border: 'none' }}>UI Redesign</Tag>
        <br />
        <Text style={{ fontSize: 11, color: 'var(--muted)' }}>2 minutes ago</Text>
      </>
    ),
  },
  {
    color: '#0284c7',
    children: (
      <>
        <Text strong style={{ fontSize: 13 }}>Marcus Johnson</Text>{' '}
        <Text style={{ color: 'var(--muted)', fontSize: 13 }}>created invoice</Text>{' '}
        <Tag color="blue" style={{ borderRadius: 6, border: 'none' }}>INV-2024-089</Tag>
        <br />
        <Text style={{ fontSize: 11, color: 'var(--muted)' }}>15 minutes ago</Text>
      </>
    ),
  },
  {
    color: '#059669',
    children: (
      <>
        <Text strong style={{ fontSize: 13 }}>Emily Watson</Text>{' '}
        <Text style={{ color: 'var(--muted)', fontSize: 13 }}>added 3 members to</Text>{' '}
        <Tag color="purple" style={{ borderRadius: 6, border: 'none' }}>Marketing Team</Tag>
        <br />
        <Text style={{ fontSize: 11, color: 'var(--muted)' }}>1 hour ago</Text>
      </>
    ),
  },
  {
    color: '#d97706',
    children: (
      <>
        <Text strong style={{ fontSize: 13 }}>Alex Rivera</Text>{' '}
        <Text style={{ color: 'var(--muted)', fontSize: 13 }}>updated project status to</Text>{' '}
        <Tag color="gold" style={{ borderRadius: 6, border: 'none' }}>In Review</Tag>
        <br />
        <Text style={{ fontSize: 11, color: 'var(--muted)' }}>3 hours ago</Text>
      </>
    ),
  },
  {
    color: '#e11d48',
    children: (
      <>
        <Text strong style={{ fontSize: 13 }}>System</Text>{' '}
        <Text style={{ color: 'var(--muted)', fontSize: 13 }}>flagged expense report</Text>{' '}
        <Tag color="red" style={{ borderRadius: 6, border: 'none' }}>Overdue</Tag>
        <br />
        <Text style={{ fontSize: 11, color: 'var(--muted)' }}>5 hours ago</Text>
      </>
    ),
  },
];

export default function Dashboard() {
  const { stats, quickActions, activeProjects, loading } = useDashboard();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back, John! Here's what's happening today."
      />

      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        {stats.map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <StatCard {...stat} />
          </Col>
        ))}
      </Row>

      <Card
        style={{
          borderRadius: 16,
          marginBottom: 24,
          border: '1px solid var(--border-subtle)',
        }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <ThunderboltOutlined style={{ color: 'var(--primary)', fontSize: 16 }} />
          <Text strong style={{ fontSize: 15 }}>Quick Actions</Text>
        </div>
        <Row gutter={[12, 12]}>
          {quickActions.map((action, i) => (
            <Col xs={12} sm={6} key={i}>
              <Button
                type="text"
                style={{
                  width: '100%',
                  height: 'auto',
                  padding: '16px',
                  borderRadius: 14,
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'all 0.2s',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: action.bg,
                    color: action.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {action.icon}
                </div>
                <Text strong style={{ fontSize: 13 }}>{action.title}</Text>
              </Button>
            </Col>
          ))}
        </Row>
      </Card>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={14}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RiseOutlined style={{ color: 'var(--primary)' }} />
                <span>Active Projects</span>
              </div>
            }
            extra={
              <Button type="link" style={{ fontWeight: 600, padding: 0 }}>
                View All <ArrowRightOutlined />
              </Button>
            }
            style={{
              borderRadius: 16,
              border: '1px solid var(--border-subtle)',
            }}
          >
            <List
              dataSource={activeProjects}
              loading={loading}
              renderItem={(project) => (
                <List.Item style={{ padding: '14px 0', border: 'none' }}>
                  <div style={{ width: '100%' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 8,
                      }}
                    >
                      <div>
                        <Text strong style={{ fontSize: 14 }}>{project.name}</Text>
                        <Tag
                          style={{
                            marginLeft: 8,
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 600,
                            border: 'none',
                          }}
                          color={
                            project.status === 'On Track'
                              ? 'green'
                              : project.status === 'At Risk'
                                ? 'gold'
                                : 'red'
                          }
                        >
                          {project.status}
                        </Tag>
                      </div>
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'var(--muted)',
                          fontWeight: 600,
                        }}
                      >
                        {project.team}
                      </Text>
                    </div>
                    <Progress
                      percent={project.progress}
                      strokeColor={
                        project.status === 'On Track'
                          ? '#059669'
                          : project.status === 'At Risk'
                            ? '#d97706'
                            : '#e11d48'
                      }
                      trailColor="rgba(0,0,0,0.04)"
                      size="small"
                      style={{ marginBottom: 0 }}
                    />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClockCircleOutlined style={{ color: 'var(--primary)' }} />
                <span>Recent Activity</span>
              </div>
            }
            extra={
              <Button type="link" style={{ fontWeight: 600, padding: 0 }}>
                View All <ArrowRightOutlined />
              </Button>
            }
            style={{
              borderRadius: 16,
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Timeline items={recentActivity} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
