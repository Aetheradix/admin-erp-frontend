export interface AnalyticsReport {
  id: string;
  title: string;
  type: string;
  createdBy: string;
  date: string;
  status: 'Published' | 'Draft';
}
