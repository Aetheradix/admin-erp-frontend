'use client';

import React from 'react';
import { Card, Button, Input, Avatar, Tag, Row, Col, Typography, Segmented } from 'antd';
import { PlusOutlined, SearchOutlined, TeamOutlined, AppstoreOutlined, BarsOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PageHeader from '@/src/components/ui/PageHeader';
import { useTeams } from './hooks/useTeams';

const { Text } = Typography;

export default function Teams() {
  const router = useRouter();
  const { teams, totalTeams, search, setSearch, view, setView } = useTeams();

  return (
    <div>
      <PageHeader
        title="Teams"
        subtitle={`${totalTeams} teams across your organization.`}
        breadcrumbs={[{ title: 'Teams' }]}
        actions={
          <Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: 10, fontWeight: 600 }}>
            Create Team
          </Button>
        }
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Input
          prefix={<SearchOutlined style={{ color: 'var(--muted)' }} />}
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 320, borderRadius: 10 }}
          allowClear
        />
        <Segmented
          value={view}
          onChange={(v) => setView(v as string)}
          options={[
            { value: 'grid', icon: <AppstoreOutlined /> },
            { value: 'list', icon: <BarsOutlined /> },
          ]}
        />
      </div>

      <Row gutter={[20, 20]}>
        {teams.map((team) => (
          <Col xs={24} sm={12} lg={view === 'grid' ? 6 : 24} key={team.id}>
            <Card
              hoverable
              onClick={() => router.push(`/teams/${team.id}`)}
              style={{
                borderRadius: 16,
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                height: '100%',
                transition: 'all 0.3s',
              }}
              styles={{ body: { padding: view === 'list' ? '16px 24px' : 24 } }}
            >
              <div style={view === 'list' ? { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } : {}}>
                <div style={view === 'list' ? { display: 'flex', alignItems: 'center', gap: 16 } : {}}>
                  <div
                    style={{
                      width: view === 'list' ? 40 : 48,
                      height: view === 'list' ? 40 : 48,
                      borderRadius: 14,
                      background: `${team.color}12`,
                      color: team.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: view === 'list' ? 18 : 22,
                      marginBottom: view === 'list' ? 0 : 16,
                    }}
                  >
                    <TeamOutlined />
                  </div>
                  <div>
                    <h3 style={{ fontSize: view === 'list' ? 15 : 16, fontWeight: 700, margin: '0 0 4px' }}>{team.name}</h3>
                    {view === 'grid' && <Text style={{ color: 'var(--muted)', fontSize: 13, display: 'block', marginBottom: 16 }}>{team.description}</Text>}
                  </div>
                </div>
                <div style={view === 'list' ? { display: 'flex', alignItems: 'center', gap: 24 } : { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Tag color="blue" style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>{team.department}</Tag>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Avatar.Group max={{ count: 3 }} size={28} style={{ marginRight: 8 }}>
                      {Array.from({ length: Math.min(team.members, 4) }).map((_, i) => (
                        <Avatar key={i} style={{ background: team.color, fontWeight: 700, fontSize: 10 }} size={28}>
                          {String.fromCharCode(65 + i)}
                        </Avatar>
                      ))}
                    </Avatar.Group>
                    <Text style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>{team.members}</Text>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
