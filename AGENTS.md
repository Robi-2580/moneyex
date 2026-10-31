# AGENTS.md

Architecture rules for this project. Keep values (colors, fonts, copy) in memory files, not here.

- Backend is Firebase: Auth (email/password + Google popup) and Firestore. Data lives only under `users/{uid}` (profile doc + `wallets|categories|transactions|budgets|loans` subcollections); every new collection must stay under `users/{uid}` — `firestore.rules` denies anything else. Why: per-user data isolation is enforced at the database layer, not in app code.
- `firestore.rules` + `firestore.json`... correction: `firebase.json` at the root deploy the rules (`firebase deploy --only firestore:rules`). Update rules and the emulator test `src/test/firestore-rules.test.ts` together when the data layout changes. Why: the test only validates what the file grants.
- The Firebase web config is fetched at runtime from the `firebase-config` edge function; never hardcode Firebase values in client code beyond public identifiers. Why: keeps config editable without a redeploy.
- Guest mode stores data in localStorage only and never touches Firestore. Why: rules require an authenticated user; queueing writes for guests would silently fail.
