export interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  category: 'Events' | 'Workplace' | 'Team' | 'Product';
  date: string;
  dimensions?: { width: number; height: number };
}

// export const mockGallery: GalleryItem[] = [
//   {
//     id: '1',
//     title: 'Future Tech Summit 2026',
//     url: 'https://images.unsplash.com/photo-1738892887249-f2d6cefb9f3c?q=80&w=973&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//     category: 'Events',
//     date: 'March 15, 2026',
//     dimensions: { width: 4, height: 3 }
//   },
//   {
//     id: '2',
//     title: 'Modern Workspace Design',
//     url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop',
//     category: 'Workplace',
//     date: 'March 10, 2026',
//     dimensions: { width: 3, height: 4 }
//   },
//   {
//     id: '3',
//     title: 'Team Collaboration Workshop',
//     url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop',
//     category: 'Team',
//     date: 'February 28, 2026',
//     dimensions: { width: 1, height: 1 }
//   },
//   {
//     id: '4',
//     title: 'New Product Launch Event',
//     url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2012&auto=format&fit=crop',
//     category: 'Events',
//     date: 'March 20, 2026',
//     dimensions: { width: 3, height: 2 }
//   },
//   {
//     id: '5',
//     title: 'Eco-Friendly Office Space',
//     url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop',
//     category: 'Workplace',
//     date: 'January 15, 2026',
//     dimensions: { width: 2, height: 3 }
//   },
//   {
//     id: '6',
//     title: 'Annual Awards Night',
//     url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop',
//     category: 'Events',
//     date: 'December 20, 2025',
//     dimensions: { width: 4, height: 3 }
//   },
//   {
//     id: '7',
//     title: 'Creative Brainstorming',
//     url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop',
//     category: 'Team',
//     date: 'March 5, 2026',
//     dimensions: { width: 3, height: 2 }
//   },
//   {
//     id: '8',
//     title: 'AI Platform Interface Preview',
//     url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop',
//     category: 'Product',
//     date: 'March 18, 2026',
//     dimensions: { width: 3, height: 4 }
//   }
// ];
