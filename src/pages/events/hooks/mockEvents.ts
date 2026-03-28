export interface ERPEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  time: string;
  location: string;
  category: 'Conference' | 'Workshop' | 'Social' | 'Meeting';
  image: string;
  organizer: string;
  attendees: number;
  date: string;
}

// export const mockEvents: ERPEvent[] = [
//   {
//     id: '1',
//     title: 'Annual Tech Summit 2026',
//     description: 'A gathering of industry leaders to discuss the future of AI and ERP systems.',
//     date: 'April 15, 2026',
//     time: '10:00 AM - 4:00 PM',
//     location: 'Grand Ballroom, Tech Plaza',
//     category: 'Conference',
//     image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2012&auto=format&fit=crop',
//     organizer: 'Engineering Team',
//     attendees: 150
//   },
//   {
//     id: '2',
//     title: 'Design Thinking Workshop',
//     description: 'A hands-on session to improve user experience and interface design skills.',
//     date: 'April 20, 2026',
//     time: '2:00 PM - 5:00 PM',
//     location: 'Creative Hub, Room 302',
//     category: 'Workshop',
//     image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop',
//     organizer: 'Product Design',
//     attendees: 45
//   },
//   {
//     id: '3',
//     title: 'Quarterly Team Lunch',
//     description: 'Celebrating our achievements and welcoming new team members.',
//     date: 'May 05, 2026',
//     time: '12:30 PM - 2:00 PM',
//     location: 'Sky Lounge Cafe',
//     category: 'Social',
//     image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop',
//     organizer: 'HR Dept',
//     attendees: 80
//   },
//   {
//     id: '4',
//     title: 'Board of Directors Meeting',
//     description: 'Strategic planning and financial review for the upcoming quarter.',
//     date: 'April 25, 2026',
//     time: '9:00 AM - 12:00 PM',
//     location: 'Executive Suite',
//     category: 'Meeting',
//     image: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=2070&auto=format&fit=crop',
//     organizer: 'Management',
//     attendees: 12
//   }
// ];
