import '../aliases';
import { expect } from 'chai';
import request from 'supertest';
import HttpStatus from 'http-status-codes';
import app from '@/app';

/**
 * Tests for health checks
 */
describe('Health check', () => {
  it('should return 200 status OK on health check endpoint', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).to.equal(HttpStatus.OK);
  });
});
