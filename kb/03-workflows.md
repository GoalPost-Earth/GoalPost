# Mobile App Workflows

Core workflows for the TDX mobile field operations app.

## Workflow Sequence

```
WF-01: Farmer Onboarding           (Field Agent registers new farmer)
WF-02: Farmer Profile Completion   (Field Agent completes incomplete profiles via tasks)
WF-03: Commitment Creation         (Aggregator declares available commodity)
WF-04: Aggregation Capture         (Aggregator records commodity weight in kg at loading)
WF-05: Tally Verification          (Sourcing Officer independently verifies weights in kg)
WF-06: Voucher Generation          (System generates payment voucher after approval)
WF-07: Voucher Redemption          (Cash Point Agent redeems voucher via MoMo)
```

---

## WF-01 — Farmer Onboarding
**Actor:** Field Agent

1. Field Agent opens farmer registration form.
2. Captures minimum data: name, community, and ID number (if available).
3. Farmer record created with `profile_status: incomplete` if any fields missing.
4. Farmer appears in directory immediately — incomplete records are not blocked from use.
5. Field Agent earns payment when a farmer profile is later completed and approved.

---

## WF-02 — Farmer Profile Completion
**Actor:** Field Agent

1. Field Agent views available tasks (incomplete farmer profiles in their district).
2. Claims a task from the queue.
3. Visits farmer and collects remaining data (phone, ID, farm details).
4. Submits completed profile.
5. Profile reviewed and approved → Field Agent's wallet credited.

---

## WF-03 — Commitment Creation
**Actor:** Aggregator

1. Aggregator creates a new commitment from their dashboard.
2. Specifies commodity type, estimated weight in kg, and pickup location.
3. Commitment visible in their commitments list.

---

## WF-04 — Aggregation Capture
**Actors:** Aggregator, Farmers

1. Aggregator opens an active aggregation session.
2. For each farmer: records commodity type, weight in kg, and farmer identity.
3. Transaction saved locally (offline-capable) with status `captured`.
4. Background sync pushes to server when connectivity available.
5. Aggregator records farmer breakdown (which farmer contributed how many kilograms).

---

## WF-05 — Tally Verification
**Actors:** Sourcing Officer, System

1. Sourcing Officer views their assigned aggregation session.
2. Records individual weights in kilograms independently using tally calculator.
3. System compares sourcing officer's tally in kg against aggregator's recorded weight in kg.
4. Match → transaction verified. Mismatch → disputed, flagged for review.
5. Sourcing Officer can close the session when tally matches.

---

## WF-06 — Voucher Generation
**Actors:** System

1. After tally verification and approval, the system generates a cash-out voucher.
2. Voucher contains: unique code, farmer name, amount in GHS.
3. Voucher status: `generated` → `pending_redemption`.
4. Farmer receives voucher code (notification or physical).

---

## WF-07 — Voucher Redemption
**Actor:** Cash Point Agent

1. Cash Point Agent opens voucher scan/search screen.
2. Enters voucher code or searches by farmer name.
3. Verifies farmer identity.
4. Confirms redemption → triggers MTN MoMo payout to farmer's phone number.
5. Voucher status: `validating` → `redeemed`.
6. Cash Point Agent sees success confirmation with transaction details.
