import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import http from 'http';

describe('seed.js', () => {
  let httpRequests = [];
  let originalRequest = http.request;

  beforeEach(() => {
    httpRequests = [];
    http.request = originalRequest;
  });

  function createHttpMock(responses) {
    http.request = (options, callback) => {
      httpRequests.push({
        method: options.method,
        path: options.path,
        body: null // captured on write
      });

      const url = `http://${options.hostname}:${options.port}${options.path}`;
      let response = responses[url] || responses[options.path] || { status: 404, body: {} };
      
      for (const [pattern, resp] of Object.entries(responses)) {
        if (url.includes(pattern) || options.path?.includes(pattern)) {
          response = resp;
          break;
        }
      }

      const mockResponse = {
        statusCode: response.status,
        on: (event, handler) => {
          if (event === 'data') {
            setTimeout(() => handler(JSON.stringify(response.body)), 0);
          } else if (event === 'end') {
            setTimeout(() => handler(), 10);
          }
        }
      };

      setTimeout(() => callback(mockResponse), 0);
      
      return {
        on: () => {},
        write: (data) => {
          const lastReq = httpRequests[httpRequests.length - 1];
          if (lastReq) lastReq.body = data;
        },
        end: () => {}
      };
    };
  }

  describe('seedSiteSettings', () => {
    it('should create site settings record', async () => {
      const { seedSiteSettings } = await import('../lib/seed.js');
      
      createHttpMock({
        '/api/collections/site_settings/records': { status: 201, body: { id: 'settings-1' } }
      });

      await seedSiteSettings('test-token', 'My Test Site', 'en', 'http://127.0.0.1:8090');

      const postRequest = httpRequests.find(r => r.method === 'POST');
      assert(postRequest, 'Should POST to site_settings');
      assert.strictEqual(postRequest.path, '/api/collections/site_settings/records');
      
      const body = JSON.parse(postRequest.body);
      assert.strictEqual(body.site_title, 'My Test Site');
      assert.strictEqual(body.lang, 'en');
      assert.strictEqual(body.robots, 'index,follow');
    });

    it('should handle creation failure gracefully', async () => {
      const { seedSiteSettings } = await import('../lib/seed.js');
      
      createHttpMock({
        '/api/collections/site_settings/records': { status: 403, body: { message: 'Forbidden' } }
      });

      // Should not throw, just log warning
      await assert.doesNotReject(
        seedSiteSettings('test-token', 'My Site', 'en', 'http://127.0.0.1:8090')
      );
    });
  });

  describe('seedPosts', () => {
    it('should create both starter posts', async () => {
      const { seedPosts } = await import('../lib/seed.js');
      
      createHttpMock({
        '/api/collections/posts/records': { status: 201, body: { id: 'post-1' } }
      });

      await seedPosts('test-token', 'http://127.0.0.1:8090');

      const postRequests = httpRequests.filter(r => r.method === 'POST');
      assert.strictEqual(postRequests.length, 2, 'Should create 2 posts');
      
      const bodies = postRequests.map(r => JSON.parse(r.body));
      assert(bodies.some(b => b.slug === 'welcome-to-ichabod'));
      assert(bodies.some(b => b.slug === 'building-with-llm'));
    });

    it('should continue on duplicate (409)', async () => {
      const { seedPosts } = await import('../lib/seed.js');
      
      let callCount = 0;
      createHttpMock({
        '/api/collections/posts/records': { 
          get status() {
            callCount++;
            return callCount === 1 ? 409 : 201;
          },
          get body() {
            return callCount === 1 ? { message: 'duplicate' } : { id: 'post-2' };
          }
        }
      });

      await seedPosts('test-token', 'http://127.0.0.1:8090');

      const postRequests = httpRequests.filter(r => r.method === 'POST');
      assert.strictEqual(postRequests.length, 2, 'Should attempt both posts');
    });

    it('should throw on unexpected error', async () => {
      const { seedPosts } = await import('../lib/seed.js');
      
      createHttpMock({
        '/api/collections/posts/records': { status: 500, body: { message: 'Server error' } }
      });

      await assert.rejects(
        seedPosts('test-token', 'http://127.0.0.1:8090'),
        /Failed to seed post/
      );
    });

    it('should include dynamic pbUrl in post content', async () => {
      const { seedPosts } = await import('../lib/seed.js');
      const customPort = 9999;
      const pbUrl = `http://127.0.0.1:${customPort}`;
      
      createHttpMock({
        '/api/collections/posts/records': { status: 201, body: { id: 'post-1' } }
      });

      await seedPosts('test-token', pbUrl);

      const postRequests = httpRequests.filter(r => r.method === 'POST');
      const bodies = postRequests.map(r => JSON.parse(r.body));
      
      // Check that the welcome post contains the correct pbUrl
      const welcomePost = bodies.find(b => b.slug === 'welcome-to-ichabod');
      assert(welcomePost.body.includes(pbUrl), 'Post body should contain dynamic pbUrl');
      assert(welcomePost.body.includes(`${pbUrl}/blog/`), 'Post body should contain blog URL');
    });
  });
});
