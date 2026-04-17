# User Roles — TDX Mobile App

## Role Summary

| # | Role | Route Protection | Bottom Nav |
|---|------|-----------------|------------|
| 1 | Field Agent | Auth only | Home, Tasks, Wallet, Profile |
| 2 | Aggregator | Role-gated | Home, Commitments, Wallet, Profile |
| 3 | Cash Point Agent | Role-gated | Home, Redeem, History, Profile |
| 4 | Sourcing Officer | Role-gated | Home, Profile |

> Multi-role users are redirected to `/role-select` on login to choose which dashboard to enter.

---

## Role Descriptions

### 1. Field Agent (`field-agent`)

Farmer onboarding and profile completion. This is their single responsibility.

**Can do:**
- Register new farmers (name, community, ID)
- Complete incomplete farmer profiles (claimed from task queue, paid per completion)
- Track earnings from completed tasks
- Request wallet withdrawals

**Cannot do:** Create commitments, capture commodities, handle vouchers.

**Routes:** `/field-agent/dashboard`, `/field-agent/onboard`, `/field-agent/tasks`, `/field-agent/tasks/incomplete-profiles`, `/field-agent/farmers/:id`, `/field-agent/farmers/:id/farms`, `/field-agent/profile`, `/field-agent/wallet`

---

### 2. Aggregator (`aggregator`)

Commodity sourcing, commitment management, and farmer breakdown recording at loading.

**Can do:**
- Create commitments ("X kg of commodity available at location Y")
- Record farmer breakdowns at loading (which farmer contributed how many kilograms)
- Generate vouchers for farmer payments
- Capture commodity aggregation data
- View farmer directory (read-only)
- Track wallet/earnings

**Cannot do:** Register new farmers (that is the field agent's job).

**Routes:** `/aggregator/dashboard`, `/aggregator/capture`, `/aggregator/commitments`, `/aggregator/commitments/new`, `/aggregator/commitments/:id`, `/aggregator/farmers`, `/aggregator/farmers/:id`, `/aggregator/wallet`, `/aggregator/profile`

---

### 3. Cash Point Agent (`cash-point`)

MTN MoMo voucher redemption — pays farmers for their commodity contributions.

**Can do:**
- Redeem farmer payment vouchers (enter voucher code)
- Search vouchers by code or farmer name
- Verify farmer identity before payout
- View redemption history

**Cannot do:** Anything related to farmer registration, commitments, or aggregation.

**Routes:** `/cashpoint/dashboard`, `/cashpoint/scan`, `/cashpoint/search`, `/cashpoint/history`, `/cashpoint/profile`, `/cashpoint/success`

---

### 4. Sourcing Officer (`sourcing-officer`)

Independent weight verification at aggregation sessions. Records weights in kilograms and compares tallies.

**Can do:**
- View assigned aggregation session details
- Record individual weights in kilograms using tally calculator
- Compare independent tally against system total
- Detect and flag weight mismatches
- Close aggregation sessions when tally matches

**Routes:** `/sourcing-officer/dashboard`, `/sourcing-officer/profile`

---

## Operating Environments

| Role | Device | Connectivity |
|------|--------|-------------|
| Field Agent | Smartphone | Often poor (rural areas) |
| Aggregator | Smartphone | Often poor (rural areas) |
| Cash Point Agent | Smartphone | Moderate (semi-urban MoMo agents) |
| Sourcing Officer | Smartphone | Often poor (at aggregation sites) |

## Field Agent vs Aggregator Separation

These are explicitly two distinct roles (see `ROLE_SEPARATION.md`):
- **Field Agent** = farmer onboarding only
- **Aggregator** = commodity capture and commitment management only
- The same person CAN hold both roles — the system supports this via multi-role arrays and the role selector screen
- Shared components (farmer directory, farmer detail) live in `/pages/agent/` and are reused by both

## Auth & Protection Notes

- Role type defined in `AuthContext.tsx`: `UserRole = 'field-agent' | 'aggregator' | 'cash-point' | 'sourcing-officer'`
- `ProtectedRoute` — checks authentication only (used for field-agent, aggregator)
- `RoleProtectedRoute` — checks authentication AND `hasRole(requiredRole)` (used for cash-point, sourcing-officer)
- `hasRole()` checks `user.roles.includes(role)`
- Auth is currently mock/demo with localStorage persistence (`tdx_user` key)
