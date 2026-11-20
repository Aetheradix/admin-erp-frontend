import { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Tag, Button, Empty, Avatar, Space } from 'antd';
import { ApartmentOutlined, UserOutlined, ArrowRightOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { departmentService } from '@/services/departmentService';
import type { Department } from '@/types/department';

const { Title, Text, Paragraph } = Typography;

export default function DepartmentsListPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setDepartments(departmentService.getDepartments());
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4 }}>
          <ApartmentOutlined style={{ color: '#1677ff', marginRight: 8 }} />
          Department Governance & Capacity Dashboards
        </Title>
        <Paragraph type="secondary">
          Monitor department reporting chains, active employee workloads, bottlenecks, and project assignments across StartupOS.
        </Paragraph>
      </div>

      {departments.length === 0 ? (
        <Empty description="No departments configured" />
      ) : (
        <Row gutter={[16, 16]}>
          {departments.map((dept) => {
            const head = departmentService.getDepartmentHead(dept.id);
            const workloads = departmentService.getWorkloadsForDept(dept.id);
            const totalTasks = workloads.reduce((sum, w) => sum + w.openTasks, 0);
            const totalOverdue = workloads.reduce((sum, w) => sum + w.overdueTasks, 0);

            return (
              <Col xs={24} sm={12} lg={8} key={dept.id}>
                <Card
                  hoverable
                  style={{ borderRadius: 12, height: '100%', display: 'flex', flexDirection: 'column' }}
                  bodyStyle={{ display: 'flex', flexDirection: 'column', flex: 1 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <Title level={4} style={{ margin: 0 }}>{dept.name}</Title>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dept.description || 'Active business unit'}
                      </Text>
                    </div>
                    <Tag color="blue">{dept.memberCount} Members</Tag>
                  </div>

                  <div style={{ marginBottom: 16, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
                      <div>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>Department Head</div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{head?.userName || 'Alex Mercer'}</div>
                      </div>
                    </div>

                    <div style={{ background: '#fafafa', padding: 10, borderRadius: 8, marginTop: 12 }}>
                      <Row gutter={8}>
                        <Col span={12}>
                          <Text type="secondary" style={{ fontSize: 11 }}>Active Tasks</Text>
                          <div style={{ fontSize: 16, fontWeight: 700 }}>{totalTasks}</div>
                        </Col>
                        <Col span={12}>
                          <Text type="secondary" style={{ fontSize: 11 }}>Overdue</Text>
                          <div style={{ fontSize: 16, fontWeight: 700, color: totalOverdue > 0 ? '#cf1322' : '#3f8600' }}>
                            {totalOverdue}
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </div>

                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Tag icon={<TeamOutlined />}>{workloads.length} Active Staff</Tag>
                    <Button
                      type="primary"
                      icon={<ArrowRightOutlined />}
                      onClick={() => navigate(`/departments/${dept.id}`)}
                    >
                      View Dashboard
                    </Button>
                  </Space>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}
