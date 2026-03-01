import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase client before importing the service
let currentResult: any = { data: null, error: null };

const makeChain = () => {
  const chain: any = {};
  chain.select = () => chain;
  chain.order = () => chain;
  chain.eq = () => chain;
  chain.gte = () => chain;
  chain.lte = () => chain;
  chain.then = (resolve: any) => resolve(currentResult);

  const insertChain: any = {};
  insertChain.select = () => ({ single: () => ({ then: (resolve: any) => resolve(currentResult) }) });
  chain.insert = (_: any) => insertChain;

  return chain;
};

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: (_table: string) => makeChain()
  }
}));

import { testService } from './testService';

describe('services/testService (integration - mocked supabase)', () => {
  beforeEach(() => {
    currentResult = { data: null, error: null };
    vi.resetAllMocks();
  });

  it('getTests returns mapped tests with single course when courses is array', async () => {
    currentResult = {
      data: [
        { id: 1, date: '2023-01-01', course_id: 10, courses: [{ id: 10, name: 'A' }] }
      ],
      error: null
    };

    const res = await testService.getTests();
    expect(Array.isArray(res)).toBe(true);
    expect(res[0]!.courses).toEqual({ id: 10, name: 'A' });
    expect(res[0]!.id).toBe(1);
  });

  it('createTest returns inserted row from supabase', async () => {
    const newTest = { date: '2024-02-02', course_id: 5 };
    currentResult = { data: { id: 99, ...newTest }, error: null };

    const created = await testService.createTest(newTest as any);
    expect(created).toBeDefined();
    expect(created!.id).toBe(99);
    expect(created!.course_id).toBe(5);
  });
});
