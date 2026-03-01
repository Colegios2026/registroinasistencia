import { describe, expect, it } from 'vitest';
import { createMutationGuard, getErrorMessage, createModalReducer } from './modalPatterns';

describe('createMutationGuard', () => {
  it('returns true when not loading', () => {
    const called: string[] = [];
    const ok = createMutationGuard(false, () => called.push('oops'));
    expect(ok).toBe(true);
    expect(called).toHaveLength(0);
  });

  it('returns false and calls handler when loading', () => {
    let invoked = false;
    const ok = createMutationGuard(true, () => { invoked = true; });
    expect(ok).toBe(false);
    expect(invoked).toBe(true);
  });

  it('returns false without handler when loading', () => {
    const ok = createMutationGuard(true);
    expect(ok).toBe(false);
  });
});

describe('getErrorMessage', () => {
  it('formats Error instances with context', () => {
    const error = new Error('Database connection failed');
    const message = getErrorMessage(error, 'Absences');
    expect(message).toBe('Error en Absences: Database connection failed');
  });

  it('formats string errors with context', () => {
    const message = getErrorMessage('Invalid input', 'Students');
    expect(message).toBe('Error en Students: Invalid input');
  });

  it('returns generic message for unknown error types', () => {
    const message = getErrorMessage({ code: 500 } as any, 'Tests');
    expect(message).toBe('Error en Tests: Ocurrió un error inesperado.');
  });

  it('handles null/undefined gracefully', () => {
    const message = getErrorMessage(null as any, 'Courses');
    expect(message).toBe('Error en Courses: Ocurrió un error inesperado.');
  });
});

describe('createModalReducer', () => {
  it('creates reducer that merges state with patch', () => {
    const reducer = createModalReducer<string>();
    const state = { isOpen: false, isDetailOpen: false, isEditing: false, selected: null, mutationLoading: false, filters: {} };
    const newState = reducer(state, { isOpen: true });
    expect(newState.isOpen).toBe(true);
    expect(newState.isDetailOpen).toBe(false); // Other fields preserved
  });

  it('handles partial updates', () => {
    const reducer = createModalReducer<string>();
    const state = { isOpen: true, isDetailOpen: false, isEditing: false, selected: null, mutationLoading: false, filters: {} };
    const newState = reducer(state, { isOpen: false });
    expect(newState.isOpen).toBe(false);
    expect(newState.isEditing).toBe(false); // Preserved
  });

  it('handles multiple patches', () => {
    const reducer = createModalReducer<string>();
    const state = { isOpen: false, isDetailOpen: false, isEditing: false, selected: null, mutationLoading: false, filters: {} };
    const newState = reducer(state, { isOpen: true, isEditing: true });
    expect(newState.isOpen).toBe(true);
    expect(newState.isEditing).toBe(true);
  });

  it('preserves selected item', () => {
    const reducer = createModalReducer<string>();
    const selectedItem = { id: '1', name: 'Test' };
    const state = { isOpen: false, isDetailOpen: false, isEditing: false, selected: null, mutationLoading: false, filters: {} };
    const newState = reducer(state, { selected: selectedItem as any });
    expect(newState.selected).toEqual(selectedItem);
  });
});
