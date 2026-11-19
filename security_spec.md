# SereMate Security Specification (Phase 0 TDD)

## 1. Core Data Invariants
1. **Strict Private Conversation Isolation**: Neither unauthenticated visitors, other users, nor administrators may read or list `/users/{userId}/conversations` or `/users/{userId}/conversations/{conversationId}/messages` unless `request.auth.uid == userId`.
2. **PII Protection**: User profiles (`/users/{userId}`) contain email and age-bracket metadata and are strictly restricted to `request.auth.uid == userId`.
3. **No Self-Assigned Admin Roles**: A user registering or updating their own `/users/{userId}` document must have `role == 'user'` and cannot elevate themselves to `'admin'`.
4. **Admin Verification**: Admin privileges require `request.auth.token.email_verified == true` and either membership in `/admins/{uid}` or matching the verified runtime admin email.
5. **Immutable Audit & Ownership Fields**: `uid`, `userId`, `reporterUid`, and `createdAt` cannot be modified after creation. `createdAt` and `updatedAt` must match `request.time`.
6. **De-Identified Analytics**: `usage_events` strictly disallow any `uid`, `email`, or message text fields via `keys().hasOnly(...)`.
7. **Anonymous Peer Community Isolation**: `community_posts` never store email or real PII; `authorUid` must match `request.auth.uid`, `hugsCount` starts at `0`, and peers may only increment `hugsCount` by `+1`.

## 2. Adversarial "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. Unauthenticated read of `/users/u1` -> DENIED.
2. User A reading User B's `/users/u2/conversations/c1` -> DENIED.
3. Admin reading User A's `/users/u1/conversations/c1/messages/m1` -> DENIED (private conversations protected from admin access by default).
4. User A creating `/users/u1` with `role: "admin"` -> DENIED.
5. User A updating `/users/u1` with shadow field `isVerified: true` -> DENIED.
6. Unverified email spoof (`email: "fenirathings@gmail.com"`, `email_verified: false`) attempting admin write to `/guidance_articles/a1` -> DENIED.
7. Non-admin user attempting to create or delete `/healthcare_resources/r1` -> DENIED.
8. User A creating `/safety_reports/s1` with `reporterUid: "u2"` (identity spoofing) -> DENIED.
9. User A creating `/safety_reports/s1` with `status: "resolved"` (state shortcutting) -> DENIED.
10. User A updating `/safety_reports/s1` after creation to change `status` or `adminNotes` -> DENIED.
11. User A injecting a 2KB document ID `/users/u1/conversations/<200-char-id>` -> DENIED (`isValidId` guard).
12. User A creating `/usage_events/e1` with an extra `userEmail` or `messageContent` shadow field -> DENIED.
13. User A creating `/community_posts/p1` with `authorUid: "u2"` or `hugsCount: 999` -> DENIED.
14. User A updating `/community_posts/p1` to rewrite another peer's `message` -> DENIED.

