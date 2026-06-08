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
import { PageHeader, StatCard, AppContainer, ContainerHeader } from '@/src/components/ui';
import { useDashboard } from './hooks/useDashboard';
import { recentActivity } from './constants/dashboard-mock-data';

const { Text } = Typography;

export default function Dashboard() {
  const { stats, quickActions, activeProjects, loading } = useDashboard();

  return (
    <AppContainer fluid>
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
        <ContainerHeader
          title="Quick Actions"
          icon={<ThunderboltOutlined />}
          style={{ marginBottom: 16 }}
        />
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
              <ContainerHeader
                title="Active Projects"
                icon={<RiseOutlined />}
                style={{ marginBottom: 0 }}
              />
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
                      railColor="rgba(0,0,0,0.04)"
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
              <ContainerHeader
                title="Recent Activity"
                icon={<ClockCircleOutlined />}
                style={{ marginBottom: 0 }}
              />
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
    </AppContainer>
  );
}
