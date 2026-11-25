import React from 'react';
import { Card, Statistic, Tag, Progress, Space, Typography, Row, Col, Empty } from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { departmentService } from '@/services/departmentService';

const { Text } = Typography;

interface EmployeeWorkloadCardProps {
  userId: number;
  style?: React.CSSProperties;
}

export const EmployeeWorkloadCard: React.FC<EmployeeWorkloadCardProps> = ({ userId, style }) => {
  const workload = departmentService.getEmployeeWorkload(userId);

  if (!workload) {
    return (
      <Card size="small" style={style}>
        <Empty
          description="No workload metrics found for this user"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  const getTagColor = (label: string) => {
    switch (label) {
      case 'Light':
        return 'success';
      case 'Moderate':
        return 'processing';
      case 'Heavy':
        return 'warning';
      case 'Overloaded':
        return 'error';
      default:
        return 'default';
    }
  };

  const getProgressStatus = (score: number) => {
    if (score > 75) return 'exception';
    if (score > 50) return 'normal';
    return 'success';
  };

  return (
    <Card
      size="small"
      title={
        <Space>
          <UserOutlined />
          <span>Workload Analysis — {workload.userName}</span>
        </Space>
      }
      extra={<Tag color={getTagColor(workload.workloadLabel)}>{workload.workloadLabel}</Tag>}
      style={{ borderRadius: 8, ...style }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Capacity Utilization Score
          </Text>
          <Text strong style={{ fontSize: 12 }}>
            {workload.workloadScore}%
          </Text>
        </div>
        <Progress
          percent={workload.workloadScore}
          status={getProgressStatus(workload.workloadScore)}
          size="small"
          showInfo={false}
        />
      </div>

      <Row gutter={[8, 8]}>
        <Col span={12}>
          <Statistic
            title={
              <Text type="secondary" style={{ fontSize: 11 }}>
                Active Tasks
              </Text>
            }
            value={workload.openTasks}
            prefix={<ClockCircleOutlined style={{ fontSize: 12 }} />}
            valueStyle={{ fontSize: 16 }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title={
              <Text type="secondary" style={{ fontSize: 11 }}>
                Overdue
              </Text>
            }
            value={workload.overdueTasks}
            valueStyle={{ fontSize: 16, color: workload.overdueTasks > 0 ? '#cf1322' : '#3f8600' }}
            prefix={<FireOutlined style={{ fontSize: 12 }} />}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title={
              <Text type="secondary" style={{ fontSize: 11 }}>
                Done (This Wk)
              </Text>
            }
            value={workload.completedThisWeek}
            prefix={<CheckCircleOutlined style={{ fontSize: 12, color: '#52c41a' }} />}
            valueStyle={{ fontSize: 16 }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title={
              <Text type="secondary" style={{ fontSize: 11 }}>
                Active Projects
              </Text>
            }
            value={workload.activeProjects}
            valueStyle={{ fontSize: 16 }}
          />
        </Col>
      </Row>

      {workload.nextDeadline && (
        <div style={{ marginTop: 8, borderTop: '1px solid #f0f0f0', paddingTop: 6 }}>
          <Text type="secondary" style={{ fontSize: 11 }}>
            Next committed deadline:{' '}
            <Text strong style={{ fontSize: 11 }}>
              {workload.nextDeadline}
            </Text>
          </Text>
        </div>
      )}
    </Card>
  );
};
