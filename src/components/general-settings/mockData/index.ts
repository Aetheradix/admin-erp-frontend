import { NotificationPreference, AppConfig } from '../types';

export const initialAppConfig: AppConfig = { 
  appName: 'AetherERP', 
  language: 'en', 
  timezone: 'America/Los_Angeles', 
  dateFormat: 'MM/DD/YYYY', 
  currency: 'USD' 
};

export const notificationPreferences: NotificationPreference[] = [
  { title: 'Email Notifications', desc: 'Receive email alerts for important updates', def: true },
  { title: 'Push Notifications', desc: 'Browser push notifications for real-time alerts', def: true },
  { title: 'Weekly Digest', desc: 'Summary of weekly activity via email', def: false },
  { title: 'Task Reminders', desc: 'Get reminded about upcoming task deadlines', def: true },
  { title: 'Invoice Alerts', desc: 'Notifications for overdue invoices', def: true },
];
