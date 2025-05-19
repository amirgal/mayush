import { createContext } from 'react';
import type { Message } from '../../types';

export type FormContextType = {
  isFormOpen: boolean;
  editingMessage: Message | null;
  openForm: (message?: Message) => void;
  closeForm: () => void;
};

export const FormContext = createContext<FormContextType | undefined>(undefined);
