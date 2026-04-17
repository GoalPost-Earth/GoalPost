# State Machines

Valid states and transitions for all core entities in the mobile app.

## Aggregation Transaction

```
Captured → PendingSync → Synced → PendingTallyVerification → Verified → PendingApproval → VoucherGenerated
                                                              ↘ Disputed → UnderReview → Verified / Rejected
                                                                            PendingApproval → Rejected
```

| Status | Description |
|--------|------------|
| `captured` | Aggregator submitted on device (goods loaded at farmer location) |
| `pending_sync` | Offline, in local sync queue |
| `synced` | Server received |
| `pending_tally_verification` | Waiting for Sourcing Officer tally verification |
| `verified` | Aggregator record matches tally — two-party verification passed |
| `disputed` | Mismatch between aggregator record and sourcing officer tally |
| `under_review` | Operations review in progress |
| `pending_approval` | Approval pending |
| `rejected` | Aggregation invalidated — no voucher, no payout |
| `voucher_generated` | Approval completed — farmer payment authorized |

---

## Cash-Out Voucher

```
Generated → PendingRedemption → Validating → Redeemed
                                           → Rejected → PendingRedemption
                               → Expired
```

| Status | Description |
|--------|------------|
| `generated` | Created after approval, not yet delivered to farmer |
| `pending_redemption` | Farmer has the code, hasn't visited Cash Point yet |
| `validating` | Cash Point Agent verifying |
| `redeemed` | Funds transferred via MoMo, voucher locked |
| `rejected` | Failed validation, can retry |
| `expired` | TTL exceeded (if applicable) |

---

## Aggregation Session

```
Created → Active ⇄ Paused → Closed
                  Active → Closed
```

| Status | Description | Who Triggers |
|--------|------------|-------------|
| `created` | Session exists, no aggregation yet | Operations |
| `active` | Aggregators can capture, syncs active | Operations |
| `paused` | No new captures, syncs continue | Operations |
| `closed` | Finalized, inventory totals locked | Sourcing Officer / Operations |

---

## Inventory Group

```
Accumulating → PendingTradeRelease → AvailableForTrade → PartiallySold → SoldOut
                                                       → SoldOut
```

| Status | Description |
|--------|------------|
| `accumulating` | Active session, quantity growing |
| `pending_trade_release` | Ready for market |
| `available_for_trade` | Listed as trade opportunity |
| `partially_sold` | Some quantity purchased |
| `sold_out` | All inventory purchased |

---

## Agent Task

```
Available → Claimed → Submitted → UnderReview → Approved → Paid
                                              → Rejected → Available
                                              → ClarificationRequested → Submitted
```

| Status | Description |
|--------|------------|
| `available` | Posted in district task queue |
| `claimed` | Field Agent claimed it |
| `submitted` | Evidence/data submitted |
| `under_review` | Being reviewed |
| `approved` | Approved for payment |
| `rejected` | Rejected, returned to queue |
| `clarification_requested` | More info needed from agent |
| `paid` | Agent wallet credited |

---

## Farmer Profile

```
Incomplete → Complete
```

| Status | Description |
|--------|------------|
| `incomplete` | Missing required fields (phone, ID, etc.) |
| `complete` | All required data present and verified |
