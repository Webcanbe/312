# 2027 Time Capsule

Sealed on **2026-09-28** for **2027-01-01 00:00:00 KST**.

The repository contains only an AES-256-GCM ciphertext and the static viewer. The plaintext and decryption key are not stored in the repository before unlock.

## Integrity
- Algorithm: AES-256-GCM
- AAD: `Webcanbe-2027-time-capsule-v1`
- Plaintext SHA-256: `543748c617855b1b383d97558a8917bf982dbac745291524b036a108b858d555`
- Unlock target: `2027-01-01T00:00:00+09:00`

The viewer checks `unlock-key.json` after the target time and decrypts locally in the browser.