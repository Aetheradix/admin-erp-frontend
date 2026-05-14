import React from 'react';
import { 
  ApiOutlined, 
  MailOutlined, 
  SlackOutlined, 
  GithubOutlined, 
  GoogleOutlined, 
  LinkOutlined 
} from '@ant-design/icons';
import { Integration } from '../types';

export const mockIntegrations: Integration[] = [
  { id: '1', name: 'Slack', description: 'Get notifications and updates directly in Slack channels.', icon: React.createElement(SlackOutlined), color: '#4A154B', connected: true, category: 'Communication' },
  { id: '2', name: 'GitHub', description: 'Sync repositories, PRs, and issues with your projects.', icon: React.createElement(GithubOutlined), color: '#24292e', connected: true, category: 'Development' },
  { id: '3', name: 'Google Workspace', description: 'Connect Gmail, Calendar, and Drive.', icon: React.createElement(GoogleOutlined), color: '#4285f4', connected: false, category: 'Productivity' },
  { id: '4', name: 'Email (SMTP)', description: 'Configure outgoing email for notifications and invoices.', icon: React.createElement(MailOutlined), color: '#E8583A', connected: true, category: 'Communication' },
  { id: '5', name: 'Stripe', description: 'Payment processing for invoices and subscriptions.', icon: React.createElement(LinkOutlined), color: '#635bff', connected: false, category: 'Finance' },
  { id: '6', name: 'Jira', description: 'Sync issues and sprints with AetherERP projects.', icon: React.createElement(ApiOutlined), color: '#0052CC', connected: false, category: 'Development' },
  { id: '7', name: 'Zapier', description: 'Automate workflows with 5000+ apps.', icon: React.createElement(ApiOutlined), color: '#FF4A00', connected: false, category: 'Automation' },
  { id: '8', name: 'Twilio', description: 'SMS notifications and two-factor authentication.', icon: React.createElement(ApiOutlined), color: '#F22F46', connected: false, category: 'Communication' },
];
