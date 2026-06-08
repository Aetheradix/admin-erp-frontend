import { useState, useEffect } from 'react';
import { Reimbursement } from '../types';
import { mockReimbursements } from '../mockData';

export function useReimbursements() {
    const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {

        const timer = setTimeout(() => {
            setReimbursements(mockReimbursements);
            setLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    const filteredReimbursements = reimbursements.filter(
        (r) =>
            r.description.toLowerCase().includes(search.toLowerCase()) ||
            r.submittedBy.toLowerCase().includes(search.toLowerCase()) ||
            r.id.toLowerCase().includes(search.toLowerCase())
    );

    const addReimbursement = (data: Omit<Reimbursement, 'id' | 'status' | 'date' | 'submittedBy'>) => {
        const newReimbursement: Reimbursement = {
            ...data,
            id: `REIM-${Math.floor(Math.random() * 10000)}`,
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            status: 'pending',
            submittedBy: 'Current User', // Placeholder
        };
        setReimbursements((prev) => [newReimbursement, ...prev]);
    };

    return {
        reimbursements: filteredReimbursements,
        totalReimbursements: reimbursements.length,
        loading,
        search,
        setSearch,
        addReimbursement,
    };
}
