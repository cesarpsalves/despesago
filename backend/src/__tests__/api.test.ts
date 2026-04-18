import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../app.js';

// Mock do Supabase para evitar chamadas reais ao banco durante integração
// Mock do Supabase para evitar chamadas reais ao banco durante integração
const mockSupabase = {
  from: () => ({
    select: () => ({
      eq: () => ({
        order: () => ({
          limit: () => ({
            single: () => Promise.resolve({ data: { company_id: 'test-co', id: 'test-user', plan: 'pro', status: 'active' }, error: null }),
            then: (cb: any) => cb({ data: [], error: null })
          }),
          single: () => Promise.resolve({ data: { plan: 'pro', status: 'active' }, error: null })
        }),
        single: () => Promise.resolve({ data: { company_id: 'test-co' }, error: null }),
        limit: () => ({
          single: () => Promise.resolve({ data: { plan: 'pro' }, error: null })
        })
      }),
      single: () => Promise.resolve({ data: { id: 'test-user', company_id: 'test-co' }, error: null }),
      order: () => ({
        limit: () => Promise.resolve({ data: [], error: null })
      })
    }),
    insert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: { id: 'test-123' }, error: null })
      })
    })
  })
};

vi.mock('../shared/db/supabaseClient.js', () => ({
  createScopedClient: () => mockSupabase,
  supabaseAdmin: mockSupabase
}));

describe('Backend API Integration', () => {
  it('GET /expenses - Should fail without auth', async () => {
    const response = await request(app).get('/api/expenses');
    expect(response.status).toBe(401);
  });

  it('POST /expenses/process - Should validate missing imageBody', async () => {
    const response = await request(app)
      .post('/api/expenses/process')
      .set('Authorization', 'Bearer mock-token')
      .send({});
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('validation_failed');
  });
});
