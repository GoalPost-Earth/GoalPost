# Architecture Decision Records — Mobile App

## ADR-001: Mobile-First Field Operations App

**Decision:** This repository is the mobile field operations app for TDX. It serves four roles: Field Agent, Aggregator, Cash Point Agent, and Sourcing Officer.

**Implication:** All features, workflows, and UI are designed for mobile-first use in the field with potentially poor connectivity.

---

## ADR-002: Offline-First with Background Sync

**Decision:** The app must work offline. Aggregation data is captured and stored locally, then synced when connectivity is available.

**Rules:**
- UUID v4 generated client-side for all records (enables offline creation)
- Local storage queue for pending syncs
- Sync ordering: aggregation transactions before tally verifications before voucher approvals
- Duplicate detection: by aggregation ID + farmer ID + timestamp within tolerance

**Why:** Field agents and aggregators often work in rural areas with intermittent connectivity. Data loss is unacceptable.

---

## ADR-003: Role-Based Routing with Multi-Role Support

**Decision:** Users can hold multiple roles. Multi-role users are shown a role selector on login. Routes are prefixed by role (`/field-agent/*`, `/aggregator/*`, `/cashpoint/*`, `/sourcing-officer/*`).

**Rules:**
- `ProtectedRoute` — checks authentication only (used for field-agent, aggregator)
- `RoleProtectedRoute` — checks authentication AND role (used for cash-point, sourcing-officer)
- Bottom navigation adapts based on active role path

**Why:** In rural Ghana, the same person often serves as both field agent and aggregator. The app must support this without separate accounts.

---

## ADR-004: Two-Party Weight Verification

**Decision:** Every aggregation transaction is independently verified by a sourcing officer using a separate tally. Weights in kilograms must match before voucher generation.

**Rules:**
- Aggregator records weight in kilograms at capture
- Sourcing Officer independently records weights in kilograms using tally calculator
- System compares both values
- Match → verified. Mismatch → disputed and flagged for review.

**Why:** Prevents weight fraud. Two independent weight records in kilograms from two different people must agree.

---

## ADR-005: Voucher-Based Farmer Payments

**Decision:** Farmers are paid via cash-out vouchers redeemed at authorized cash point agents, not direct bank transfers.

**Flow:** Aggregation verified → Voucher generated → Farmer takes code to Cash Point → Cash Point triggers MoMo payout.

**Why:** Many farmers don't have bank accounts but do have MoMo. Cash Point Agents serve as decentralized payment terminals. The voucher creates an auditable trail.

---

## ADR-006: Field Agent and Aggregator Are Separate Roles

**Decision:** Field Agent (farmer onboarding) and Aggregator (commodity capture) are explicitly separate responsibilities with separate dashboards and routes.

**Why:** Clear accountability. One person onboards farmers, another handles commodity logistics. The same person can hold both roles but the responsibilities don't overlap. See `ROLE_SEPARATION.md` for full details.
