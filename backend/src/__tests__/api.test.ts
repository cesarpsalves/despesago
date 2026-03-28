import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../app.js';

// Mock do Supabase para evitar chamadas reais ao banco durante integração
vi.mock('../shared/db/supabaseClient.js', () => ({
  createScopedClient: () => ({
    from: () => ({
      select: () => ({
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
  })
}));

describe('Backend API Integration', () => {
  it('GET /expenses - Should fail without auth', async () => {
    const response = await request(app).get('/expenses');
    expect(response.status).toBe(401);
  });

  it('POST /expenses/process - Should validate missing imageBody', async () => {
    const response = await request(app)
      .post('/expenses/process')
      .set('Authorization', 'Bearer mock-token')
      .send({});
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('validation_failed');
  });
});
