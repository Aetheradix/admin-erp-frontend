export const useDashboardData = () => {
  // Hardcoded for now, but easily replaceable with API call
  const projects = [
    {
      id: '1',
      title: 'Decem App',
      tasks: 908,
      value: '$ 391,991',
      color: '#E8583A',
      category: 'FINANCE',
      participants: 14,
    },
    {
      id: '2',
      title: 'SkyLux',
      tasks: 12,
      value: '$ 51,792',
      color: '#fbbd34',
      category: 'EDUCATION',
      participants: 4,
    },
    {
      id: '3',
      title: 'DushMash',
      tasks: 32,
      value: '$ 31,955',
      color: '#9747ff',
      category: 'FINANCE',
      participants: 3,
    },
    {
      id: '4',
      title: 'Biofarm',
      tasks: 19,
      value: '$ 11,538',
      color: '#34d399',
      category: 'HEALTHCARE',
      participants: 6,
    },
    {
      id: '5',
      title: 'PAD move',
      tasks: 35,
      value: '$ 21,688',
      color: '#fb7185',
      category: 'TRAVEL',
      participants: 5,
    },
  ];

  const stats = {
    averageValue: '$ 568,338',
    valueVsLy: '- 321.339 VS LY',
    averageTasks: 89.3,
    tasksVsLy: '+ 41.4 VS LY',
    totalProjects: 88,
  };

  return { projects, stats };
};
