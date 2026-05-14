export interface NotificationPreference {
  title: string;
  desc: string;
  def: boolean;
}

export interface AppConfig {
  appName: string;
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
}
