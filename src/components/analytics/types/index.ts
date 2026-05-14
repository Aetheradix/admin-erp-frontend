export interface Metric {
  label: string;
  value: string;
  desc: string;
}

export interface Department {
  name: string;
  score: number;
  tasks: number;
  color: string;
}

export interface Report {
  id: string;
  title: string;
  date: string;
  type: string;
}
