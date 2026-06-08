'use client';

import React from 'react';
import { Button, Input, Row, Col, Segmented } from 'antd';
import { PlusOutlined, SearchOutlined, AppstoreOutlined, BarsOutlined } from '@ant-design/icons';
import { PageHeader, AppContainer } from '@/src/components/ui';
import { useTeams } from './hooks/useTeams';
import TeamCard from './components/TeamCard';

export default function Teams() {
  const { teams, totalTeams, search, setSearch, view, setView } = useTeams();

  return (
    <AppContainer fluid>
      <PageHeader
        title="Teams"
        subtitle={`${totalTeams} teams across your organization.`}
        breadcrumbs={[{ title: 'Teams' }]}
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            style={{ borderRadius: 10, fontWeight: 600 }}
          >
            Create Team
          </Button>
        }
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20
        }}
      >
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
            <TeamCard team={team} view={view as 'grid' | 'list'} />
          </Col>
        ))}
      </Row>
    </AppContainer>
  );
}
