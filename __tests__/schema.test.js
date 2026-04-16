import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import http from 'http';

describe('schema.js', () => {
  let httpRequests = [];
  let originalRequest = http.request;
  let originalGet = http.get;

  beforeEach(() => {
    httpRequests = [];
    // Restore originals before each test
    http.request = originalRequest;
    http.get = originalGet;
  });

  function createHttpMock(responses) {
    http.request = (options, callback) => {
      httpRequests.push({
        method: options.method,
        path: options.path,
        hostname: options.hostname,
        port: options.port,
        headers: options.headers
      });

      const url = `http://${options.hostname}:${options.port}${options.path}`;
      let response = responses[url] || { status: 404, body: { message: 'Not found' } };
      
      // Support path patterns
      for (const [pattern, resp] of Object.entries(responses)) {
        if (url.includes(pattern)) {
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
        write: () => {},
        end: () => {}
      };
    };

    // Also mock http.get
    http.get = (options, callback) => {
      const url = `http://${options.hostname}:${options.port}${options.pathname}${options.search}`;
      
      let response = { status: 404, body: { message: 'Not found' } };
      for (const [pattern, resp] of Object.entries(responses)) {
        if (url.includes(pattern)) {
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
      
      return { on: () => {} };
    };
  }

  describe('createSiteSettingsCollection', () => {
    it('should create collection when it does not exist', async () => {
      const { createSiteSettingsCollection } = await import('../lib/schema.js');
      
      createHttpMock({
        '/api/collections/site_settings': { status: 404, body: {} },
        '/api/collections': { status: 200, body: { id: 'test-id' } }
      });

      await createSiteSettingsCollection('test-token', 'http://127.0.0.1:8090');

      // Should make GET to check existence, then POST to create
      const getRequest = httpRequests.find(r => r.method === undefined && r.path?.includes('site_settings'));
      const postRequest = httpRequests.find(r => r.method === 'POST');
      
      assert(getRequest, 'Should check if collection exists');
      assert(postRequest, 'Should POST to create collection');
      assert.strictEqual(postRequest.path, '/api/collections');
    });

    it('should skip when collection already exists', async () => {
      const { createSiteSettingsCollection } = await import('../lib/schema.js');
      
      createHttpMock({
        '/api/collections/site_settings': { 
          status: 200, 
          body: { id: 'existing-id', name: 'site_settings' } 
        }
      });

      await createSiteSettingsCollection('test-token', 'http://127.0.0.1:8090');

      // Should only make GET request, no POST
      const postRequest = httpRequests.find(r => r.method === 'POST');
      assert(!postRequest, 'Should not POST when collection exists');
    });

    it('should throw on creation failure', async () => {
      const { createSiteSettingsCollection } = await import('../lib/schema.js');
      
      createHttpMock({
        '/api/collections/site_settings': { status: 404, body: {} },
        '/api/collections': { status: 400, body: { message: 'Invalid schema' } }
      });

      await assert.rejects(
        createSiteSettingsCollection('test-token', 'http://127.0.0.1:8090'),
        /Failed to create site_settings/
      );
    });
  });

  describe('createPostsCollection', () => {
    it('should create posts collection with SEO fields', async () => {
      const { createPostsCollection } = await import('../lib/schema.js');
      
      createHttpMock({
        '/api/collections/posts': { status: 404, body: {} },
        '/api/collections': { status: 201, body: { id: 'posts-id' } }
      });

      await createPostsCollection('test-token', 'http://127.0.0.1:8090');

      const postRequest = httpRequests.find(r => r.method === 'POST');
      assert(postRequest, 'Should POST to create collection');
    });

    it('should skip when posts collection exists', async () => {
      const { createPostsCollection } = await import('../lib/schema.js');
      
      createHttpMock({
        '/api/collections/posts': { 
          status: 200, 
          body: { id: 'existing', name: 'posts' } 
        }
      });

      await createPostsCollection('test-token', 'http://127.0.0.1:8090');

      const postRequest = httpRequests.find(r => r.method === 'POST');
      assert(!postRequest, 'Should not POST when collection exists');
    });
  });

  describe('discoverCollections', () => {
    it('should return filtered collections', async () => {
      const { discoverCollections } = await import('../lib/schema.js');
      
      createHttpMock({
        '/api/collections': {
          status: 200,
          body: {
            items: [
              { id: '1', name: '_superusers', fields: [{ name: 'email' }] },
              { id: '2', name: 'posts', fields: [{ name: 'title' }] },
              { id: '3', name: 'site_settings', fields: [{ name: 'site_title' }] }
            ]
          }
        }
      });

      const collections = await discoverCollections('test-token', 'http://127.0.0.1:8090');

      // Should filter out _superusers
      assert.strictEqual(collections.length, 2);
      assert(!collections.some(c => c.name.startsWith('_')));
      assert(collections.some(c => c.name === 'posts'));
      assert(collections.some(c => c.name === 'site_settings'));
    });

    it('should throw on fetch failure', async () => {
      const { discoverCollections } = await import('../lib/schema.js');
      
      createHttpMock({
        '/api/collections': { status: 403, body: { message: 'Forbidden' } }
      });

      await assert.rejects(
        discoverCollections('test-token', 'http://127.0.0.1:8090'),
        /Failed to fetch collections/
      );
    });
  });
});
