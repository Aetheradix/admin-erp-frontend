import { useCallback, useState, type FormEvent } from 'react';
import { EXPENSE_CATEGORIES, MULTI_USER_CATEGORIES } from '../constants';
import type { UserOption } from '../types';

interface UseExpenseFormOptions {
  availableUsers: UserOption[];
  onCreate: (formData: FormData) => Promise<void>;
  onClose: () => void;
}

export function useExpenseForm({ availableUsers, onCreate, onClose }: UseExpenseFormOptions) {
  const [isSharedExpense, setIsSharedExpense] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    EXPENSE_CATEGORIES[1] || 'General'
  );
  const [selectedUserIds, setSelectedUserIds] = useState<Array<number | string>>([]);
  const [amountInput, setAmountInput] = useState('');

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    if (
      MULTI_USER_CATEGORIES.some((multiCategory) =>
        category.toLowerCase().includes(multiCategory.toLowerCase())
      )
    ) {
      setIsSharedExpense(true);
    }
  }, []);

  const toggleUserSelection = useCallback((userId: number | string) => {
    setSelectedUserIds((previous) =>
      previous.includes(userId) ? previous.filter((id) => id !== userId) : [...previous, userId]
    );
  }, []);

  const handleSelectAllUsers = useCallback(() => {
    setSelectedUserIds((previous) =>
      previous.length === availableUsers.length ? [] : availableUsers.map((user) => user.id)
    );
  }, [availableUsers]);

  const closeForm = useCallback(() => {
    onClose();
    setIsSharedExpense(false);
    setSelectedUserIds([]);
    setAmountInput('');
  }, [onClose]);

  const submitForm = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);

      if (isSharedExpense && selectedUserIds.length > 0) {
        formData.append('is_shared', 'true');
        formData.append('participant_ids', JSON.stringify(selectedUserIds));
      }

      await onCreate(formData);
      closeForm();
    },
    [isSharedExpense, selectedUserIds, onCreate, closeForm]
  );

  const parsedAmount = parseFloat(amountInput) || 0;
  const participantCount = selectedUserIds.length;
  const splitAmount = participantCount > 0 ? parsedAmount / participantCount : 0;

  return {
    isSharedExpense,
    setIsSharedExpense,
    selectedCategory,
    handleCategoryChange,
    selectedUserIds,
    toggleUserSelection,
    handleSelectAllUsers,
    amountInput,
    setAmountInput,
    parsedAmount,
    participantCount,
    splitAmount,
    closeForm,
    submitForm,
  };
}
