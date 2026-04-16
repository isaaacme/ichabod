# Ichabod Mock Tests

Mock tests using Node.js built-in test runner (`node:test`). These tests mock external dependencies (HTTP, file system, child_process) to test logic in isolation.

## Run Tests

```bash
# Run all tests
npm test

# Run specific test file
node --test __tests__/port.test.js

# Run with verbose output
node --test --test-reporter=spec __tests__/*.test.js

# Run with coverage (Node 20+)
node --test --experimental-test-coverage __tests__/*.test.js
```

## Test Files

| File | Coverage |
|------|----------|
| `port.test.js` | Port discovery, availability checking |
| `setup.test.js` | HTTP utilities, PocketBase spawning |
| `schema.test.js` | Collection creation, schema discovery |
| `seed.test.js` | Data seeding, duplicate handling |

## Mock Strategy

- **HTTP**: Mock `http.request` and `http.get` to simulate PocketBase API responses
- **File System**: Use temporary directories in `/tmp` for file operations
- **child_process.spawn**: Return mock process objects with controllable exit codes
- **Network**: Use high-numbered ports (54321+) to avoid conflicts

## Adding Tests

```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('my feature', () => {
  it('should work', async () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = await myFunction(input);
    
    // Assert
    assert.strictEqual(result, expected);
  });
});
```
