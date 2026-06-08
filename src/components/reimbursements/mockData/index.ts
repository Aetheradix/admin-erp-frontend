import { Reimbursement } from '../types';

export const mockReimbursements: Reimbursement[] = [
    {
        id: 'REIMB-001',
        description: 'Business Trip to NY - Flight',
        category: 'Travel',
        amount: '$1,250.00',
        date: '2024-05-15',
        submittedBy: 'John Doe',
        status: 'pending',
    },
    {
        id: 'REIMB-002',
        description: 'Client Lunch - Tech Solutions',
        category: 'Meals',
        amount: '$85.50',
        date: '2024-05-16',
        submittedBy: 'Jane Smith',
        status: 'approved',
    },
    {
        id: 'REIMB-003',
        description: 'Office Supplies - Ink & Paper',
        category: 'Office Supplies',
        amount: '$120.00',
        date: '2024-05-18',
        submittedBy: 'Mike Johnson',
        status: 'paid',
    },
    {
        id: 'REIMB-004',
        description: 'JavaScript Conference Entry',
        category: 'Professional Development',
        amount: '$450.00',
        date: '2024-05-20',
        submittedBy: 'Sarah Wilson',
        status: 'rejected',
    },
    {
        id: 'REIMB-005',
        description: 'AWS Summit Travel',
        category: 'Travel',
        amount: '$340.25',
        date: '2024-05-22',
        submittedBy: 'John Doe',
        status: 'pending',
    },
];

export const categoryColors: Record<string, string> = {
    Travel: 'blue',
    Meals: 'orange',
    'Office Supplies': 'cyan',
    'Professional Development': 'purple',
    Other: 'default',
};
