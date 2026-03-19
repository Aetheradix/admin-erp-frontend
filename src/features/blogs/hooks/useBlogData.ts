import { useMemo } from 'react';

export const useBlogData = () => {
  const blogs = useMemo(() => [
    {
      id: 1,
      title: 'Modern Architecture in 2024',
      author: 'John Doe',
      date: 'March 15, 2024',
      status: 'published',
      category: 'Design'
    },
    {
      id: 2,
      title: 'The Future of AI in ERP',
      author: 'Jane Smith',
      date: 'March 12, 2024',
      status: 'draft',
      category: 'Technology'
    },
    {
      id: 3,
      title: 'Sustainable Business Practices',
      author: 'Mike Johnson',
      date: 'March 10, 2024',
      status: 'archived',
      category: 'Management'
    }
  ], []);

  return {
    blogs
  };
};
