# Firestore Security Specification

## 1. Data Invariants
1. **Default-Deny Baseline**: Every unspecified document path is denied all reads and writes via the catch-all rule.
2. **Verified Identity**: All authenticated mutations require `request.auth != null && request.auth.token.email_verified == true`.
3. **Public Non-PII Catalog (`portalSettings/publicCatalog`)**: Visitors may `get` non-PII website items (`admin_console_link`, `custom_projects`, `custom_anime`, `custom_games`, `shadow_master_tutorials`, `custom_tools`, `deleted_item_ids`). All `create` and `update` mutations are strictly restricted to verified admins (`isAdmin()`), and `list`/`delete` are denied.
4. **Private Admin & PII Boundary (`portalSettings/globalConfigs`)**: Because `globalConfigs` stores sensitive user submissions and records (`user_suggestions`, `user_appointments`, `user_activity_logs`, `chatbot_passcodes`), both `get` and `write` are strictly restricted to verified admins (`isAdmin()`). `list` and `delete` are denied.
5. **Music Catalog (`portalSettings/musicLibrary`)**: Non-PII music metadata and playlist labels may be read via `get` so visitors see admin-published music updates immediately; only verified admins may `create`, `update`, or `delete` the music library.
6. **User Profile PII Isolation (`/users/{userId}`)**: Users can only read or write their own profile where `userId == request.auth.uid`, and `uid` and `createdAt` remain immutable after creation. Self-escalation via `role`/`isAdmin` shadow keys is blocked by strict `keys().hasOnly(...)`.
7. **Temporal & Structural Integrity**: `updatedAt == request.time`, `createdAt == request.time`, strict key allowlists (`hasAll` + `hasOnly`), `isValidId()` regex checks on dynamic document IDs, and explicit `.size()` bounds on every string and list.

## 2. Adversarial "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated read of PII config**: `GET /portalSettings/globalConfigs` with `auth == null` -> DENIED.
2. **Non-admin read of PII config**: `GET /portalSettings/globalConfigs` as `visitor@example.com` -> DENIED.
3. **Guest mutation of public catalog**: `UPDATE /portalSettings/publicCatalog` as non-admin signed-in user or guest -> DENIED by `isAdmin()`.
4. **Spoofed unverified admin email**: `WRITE /portalSettings/publicCatalog` with `email: "adriangabionza1990@gmail.com"`, `email_verified: false` -> DENIED.
5. **Ghost field injection on PublicCatalog**: `UPDATE /portalSettings/publicCatalog` including PII or shadow key `user_appointments` or `isAdmin: true` -> DENIED by `keys().hasOnly(...)`.
6. **Oversized string Denial-of-Wallet**: `UPDATE /portalSettings/publicCatalog` with `admin_console_link` > 512 chars -> DENIED.
7. **Unbounded array injection on MusicLibrary**: `UPDATE /portalSettings/musicLibrary` with `tracks.size() > 500` -> DENIED.
8. **Client-forged timestamp**: `CREATE /users/{uid}` with `createdAt: "2020-01-01T00:00:00Z"` instead of `request.time` -> DENIED.
9. **Immutable field tampering**: `UPDATE /users/{uid}` changing `uid` or `createdAt` -> DENIED.
10. **ID poisoning**: `GET /users/../../etc/passwd` or 500-char doc ID -> DENIED by `isValidId(userId)`.
11. **Admin collection escalation**: `CREATE /admins/attacker_uid` -> DENIED (`allow create, update, delete: if false`).
12. **List scraping on users**: `LIST /users` without owner constraint (`resource.data.uid == request.auth.uid`) -> DENIED.
