/**
 * Common modal patterns and utilities to reduce duplication across pages.
 * Provides reusable handlers and state management patterns for detail modals.
 */

/**
 * Standard useReducer pattern for modal UI state
 * Use this pattern in pages that need modal + list view
 */
export type ModalUIState<T> = {
  isOpen: boolean;
  isDetailOpen: boolean;
  isEditing: boolean;
  selected: T | null;
  mutationLoading: boolean;
  filters: Record<string, any>;
};

export type ModalUIAction<T> = Partial<ModalUIState<T>>;

export const createModalReducer = <T>() => {
  return (state: ModalUIState<T>, patch: ModalUIAction<T>): ModalUIState<T> => ({
    ...state,
    ...patch
  });
};

/**
 * Creates a reusable handler that prevents rapid/double-submission
 * by checking mutationLoading state before allowing action
 */
export const createMutationGuard = (
  mutationLoading: boolean,
  onAlreadyLoading?: () => void
): boolean => {
  if (mutationLoading) {
    onAlreadyLoading?.();
    return false;
  }
  return true;
};

/**
 * Standardized error toast message based on error type
 * Helps normalize error reporting across pages
 */
export const getErrorMessage = (error: unknown, context: string): string => {
  if (error instanceof Error) {
    return `Error en ${context}: ${error.message}`;
  }
  if (typeof error === 'string') {
    return `Error en ${context}: ${error}`;
  }
  return `Error en ${context}: Ocurrió un error inesperado.`;
};
