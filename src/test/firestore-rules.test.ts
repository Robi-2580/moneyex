// @vitest-environment node
// Firestore security rules test: verifies per-user data isolation.
// Requires the Firestore emulator on localhost:8088 — runs with:
//   bunx firebase-tools emulators:exec --only firestore "bunx vitest run src/test/firestore-rules.test.ts"
// The whole suite is skipped when the emulator is not running, so plain
// `bunx vitest run` is unaffected.
import { readFileSync } from 'fs';
import path from 'path';
import { beforeAll, afterAll, test, describe } from 'vitest';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';

let emulatorUp = false;
try {
  const res = await fetch('http://localhost:8088/', { method: 'POST', signal: AbortSignal.timeout(1500) });
  emulatorUp = res.status < 500 || res.status === 400;
} catch {
  emulatorUp = false;
}

describe.skipIf(!emulatorUp)('firestore.rules: per-user data isolation', () => {
  let env: TestEnvironment;
  let alice: ReturnType<TestEnvironment['authenticatedContext']>;
  let bob: ReturnType<TestEnvironment['authenticatedContext']>;
  let unauth: ReturnType<TestEnvironment['unauthenticatedContext']>;

  beforeAll(async () => {
    env = await initializeTestEnvironment({
      projectId: 'rules-test',
      firestore: {
        rules: readFileSync(path.resolve(__dirname, '../../firestore.rules'), 'utf8'),
        host: 'localhost',
        port: 8088,
      },
    });
    alice = env.authenticatedContext('alice');
    bob = env.authenticatedContext('bob');
    unauth = env.unauthenticatedContext();
  }, 120000);

  afterAll(async () => {
    try { await env?.cleanup(); } catch {}
  });

  test('owner can write profile doc', () =>
    assertSucceeds(alice.firestore().doc('users/alice').set({ isDark: true, language: 'bn' })));
  test('owner can write subcollection doc', () =>
    assertSucceeds(alice.firestore().doc('users/alice/wallets/w1').set({ name: 'Cash', balance: 100 })));
  test('owner can read own subcollection', () =>
    assertSucceeds(alice.firestore().collection('users/alice/wallets').get()));
  test('another user cannot read the profile', () =>
    assertFails(bob.firestore().doc('users/alice').get()));
  test('another user cannot read the wallets', () =>
    assertFails(bob.firestore().collection('users/alice/wallets').get()));
  test('another user cannot write to the wallets', () =>
    assertFails(bob.firestore().doc('users/alice/wallets/w1').set({ balance: 0 })));
  test('another user cannot delete a transaction', () =>
    assertFails(bob.firestore().doc('users/alice/transactions/t1').delete()));
  test('unauthenticated user cannot read anything', () =>
    assertFails(unauth.firestore().doc('users/alice').get()));
  test('unauthenticated user cannot write anything', () =>
    assertFails(unauth.firestore().doc('users/alice/wallets/w1').set({ x: 1 })));
  test('paths outside users/ are denied', () =>
    assertFails(alice.firestore().doc('public/config').get()));
});
