# Test Hanging Issue Suggestions

This project has over 1200 tests. The entire test suite takes over 3 minutes to run. The tests frequently hang partway through the test run.

Another developer suggested some specific changes that might resolve the test hanging problem.

Should we implement any or all of these?

## 1. The Silver Bullet: Switch to 'Forks'

By default, Vitest uses worker threads. jsdom is known to have issues releasing memory correctly inside threads. Switching the pool to forks runs tests in child processes. This is slightly slower to start up, but it guarantees that when a test file finishes, the operating system reclaims the memory completely.

Update your `vitest.config.ts`:

```TypeScript
export default defineConfig({
    // ... plugins
    test: {
        // ... existing config
        pool: 'forks', // <--- ADD THIS
        poolOptions: {
            forks: {
                isolate: true, // safe to keep on when using forks
                singleFork: false,
            },
        },
        // Remove 'maxWorkers: 4' to let Vitest detect CPU count,
        // OR reduce it to 50% to prevent CPU choking.
    },
    // ... resolve
});
```

## 2. Disable Isolation (If 'Forks' is too slow)

If switching to forks makes the tests run too slowly, your next best bet is to stop reloading the environment for every file. This makes the tests run much faster but requires your tests to be "clean" (i.e., they must clean up mocks/spies in afterEach).

```TypeScript
export default defineConfig({
    test: {
        // ...
        isolate: false, // <--- CAUTION: Shared state between files
        fileParallelism: false, // Try false if you suspect race conditions
        // ...
    },
});
```

Note: If you do this, you might see tests failing that previously passed due to "pollution" from previous tests. This exposes bad test practices but fixes the hanging.

## 3. Switch to Happy-DOM (Performance)

jsdom is a heavy implementation of a browser environment. happy-dom is a lighter, faster alternative often used in Next.js projects.

Install: `npm install -D happy-dom`

Update Config:

```TypeScript
export default defineConfig({
    test: {
        environment: 'happy-dom', // <--- Change from 'jsdom'
    }
});
```

Warning: happy-dom is not 100% feature-complete compared to jsdom. You might have a few tests fail if they rely on obscure DOM APIs.

## 4. Enable Heap Logging

To verify if memory is indeed the culprit, enable heap logging. This won't fix the hang, but it will tell you if you are hitting a ceiling.

```TypeScript
export default defineConfig({
    test: {
        logHeapUsage: true,
    }
});
```

If you see the heap usage creeping up (e.g., 400MB -> 800MB -> 1.5GB) and then it hangs, you have a memory leak (solved by Solution #1).

## 5. Check for Open Handles

Sometimes tests hang because a setTimeout, setInterval, or database connection wasn't closed. Vitest has a flag to detect this.

Run your tests with: `npx vitest run --dangerouslyIgnoreUnhandledErrors --detectOpenHandles`

## 6. Add Global Test Cleanup Handlers

The `setup.ts` file is generally clean, but it is missing global cleanup handlers.

In a suite of 1200+ tests, the accumulation of mock history (calls made to `vi.fn()`) and DOM elements that aren't properly unmounted can cause memory bloat and the eventual "hang" you are seeing.

Here are the specific issues and the corrected code.

### 1. Missing afterEach Cleanup

You are defining mocks (like `useRouter`), but you aren't clearing their call history between tests.

- The Risk: If `useRouter().push` is called 50 times in a file, that memory is held until the file finishes. In a worker thread, this garbage collection might be delayed.
- The Fix: Add `afterEach` to clear mocks and clean the DOM.

### 2. No Global `fetch` Mock (The likely cause of "Hanging")

Your file doesn't mock `fetch`. If your components (or Supabase client) attempt to make a network request and you haven't mocked it in a specific test, the test will actually try to hit the network.

- The Risk: It will sit there waiting for a response until the 10s timeout triggers, or worse, hang indefinitely if the connection stalls.
- The Fix: Stub the global `fetch` to ensure no real network requests leak out.

### Unsafe Console Mocking

Overwriting `console.error` directly is risky if a test crashes before afterAll runs. It's safer to use `vi.spyOn`.
