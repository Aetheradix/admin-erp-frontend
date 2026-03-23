export interface Blog {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    image?: string;
  };
  category: string;
  tags: string[];
  status: 'Published' | 'Draft' | 'Scheduled';
  featuredImage: string;
  publishDate: string;
  views: number;
  readTime: string;
}

export const mockBlogs: Blog[] = [
  {
    id: '1',
    title: 'The Future of ERP Systems in 2026',
    excerpt: 'Discover how AI and automation are reshaping the enterprise resource planning landscape.',
    content: '<p>Enterprise Resource Planning (ERP) systems have come a long way since their inception. In 2026, we are seeing a massive shift towards <strong>Autonomous ERP</strong>...</p>',
    author: {
      name: 'Sarah Chen',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
    },
    category: 'Technology',
    tags: ['ERP', 'AI', 'Business'],
    status: 'Published',
    featuredImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
    publishDate: '2026-03-15T10:00:00Z',
    views: 1240,
    readTime: '5 min'
  },
  {
    id: '2',
    title: 'Mastering Remote Team Management',
    excerpt: 'Best practices for keeping your distributed workforce engaged and productive.',
    content: '<p>Managing a remote team requires more than just Zoom calls. It requires building a culture of trust and clear communication...</p>',
    author: {
      name: 'Marcus Bell',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus'
    },
    category: 'Management',
    tags: ['Remote', 'Leadership', 'Productivity'],
    status: 'Published',
    featuredImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    publishDate: '2026-03-18T14:30:00Z',
    views: 856,
    readTime: '8 min'
  },
  {
    id: '3',
    title: 'Sustainable Growth Strategies',
    excerpt: 'How to scale your business without compromising on your core values.',
    content: '<p>Growth is the goal of every startup, but scaling sustainably is the real challenge...</p>',
    author: {
      name: 'Elena Rodriguez',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena'
    },
    category: 'Business',
    tags: ['Strategy', 'Sustainability', 'Scale'],
    status: 'Draft',
    featuredImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop',
    publishDate: '2026-03-22T09:00:00Z',
    views: 0,
    readTime: '6 min'
  }
];
