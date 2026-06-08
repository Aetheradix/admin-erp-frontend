'use client';

import React from 'react';
import { Row, Col } from 'antd';
import { PageHeader, AppContainer } from '@/src/components/ui';
import { useIntegrations } from './hooks/useIntegrations';
import IntegrationCard from './components/IntegrationCard';

export default function Integrations() {
  const { integrations, loading } = useIntegrations();

  return (
    <AppContainer fluid>
      <PageHeader
        title="Integrations"
        subtitle="Connect third-party services to enhance your workflow."
        breadcrumbs={[{ title: 'Settings' }, { title: 'Integrations' }]}
      />

      <Row gutter={[20, 20]}>
        {integrations.map((integration) => (
          <Col xs={24} sm={12} lg={8} key={integration.id}>
            <IntegrationCard
              integration={integration}
              loading={loading}
            />
          </Col>
        ))}
      </Row>
    </AppContainer>
  );
}
