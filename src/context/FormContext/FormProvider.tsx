import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Message } from '../../types';
import { FormContext } from './context';

type FormProviderProps = {
  children: ReactNode;
};

export const FormProvider = ({ children }: FormProviderProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  const openForm = useCallback((message?: Message) => {
    setEditingMessage(message || null);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingMessage(null);
  }, []);

  return (
    <FormContext.Provider value={{ isFormOpen, editingMessage, openForm, closeForm }}>
      {children}
    </FormContext.Provider>
  );
};
