# Data Entities

All entities relevant to the mobile field operations app — their fields and relationships.

## Entity Relationship Overview

```
Farmer → AggregationTransaction → TallySheetVerification
              ↓                         ↓
         CashOutVoucher → VoucherRedemption
              ↓
         InventoryGroup
```

## Core Entities

### AggregationSession
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| aggregation_unit_id | UUID | FK to AggregationUnit |
| status | enum | created / active / paused / closed |
| started_at | timestamp | |
| closed_at | timestamp | nullable |

### AggregationTransaction
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| session_id | UUID | FK to AggregationSession |
| farmer_id | UUID | FK to Farmer |
| agent_id | UUID | FK to User (aggregator role) |
| vehicle_id | UUID | FK to Vehicle |
| commodity_id | UUID | FK to Commodity |
| weight_kg | decimal | |
| status | enum | captured / pending_sync / synced / pending_tally_verification / verified / disputed / under_review / pending_approval / rejected / voucher_generated |
| captured_at | timestamp | |

### Farmer
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| name | string | |
| community_id | UUID | FK to Community |
| phone | string | nullable |
| id_type | string | nullable |
| id_number | string | nullable |
| profile_status | enum | incomplete / complete |

### TallySheetVerification
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| aggregation_transaction_id | UUID | FK to AggregationTransaction |
| sourcing_officer_id | UUID | FK to User (sourcing officer role) |
| tally_weight_kg | decimal | |
| status | enum | uploaded / verified / disputed |
| uploaded_at | timestamp | |

### Commodity
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| name | string | e.g., Maize, Soy, Groundnut, Rice |
| unit | string | kg |

### InventoryGroup
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| session_id | UUID | FK to AggregationSession |
| commodity_id | UUID | FK to Commodity |
| total_quantity_kg | decimal | Updates dynamically |
| status | enum | accumulating / pending_trade_release / available_for_trade / partially_sold / sold_out |

### CashOutVoucher
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| aggregation_transaction_id | UUID | FK to AggregationTransaction |
| farmer_id | UUID | FK to Farmer |
| amount | decimal | GHS |
| code | string | Unique (e.g., TDX-V-8A3F2K) |
| status | enum | generated / pending_redemption / validating / redeemed / rejected / expired |
| generated_at | timestamp | |

### VoucherRedemption
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| voucher_id | UUID | FK to CashOutVoucher |
| cash_point_agent_id | UUID | FK to User (cash-point role) |
| amount | decimal | GHS |
| redeemed_at | timestamp | |

### AgentTask
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| type | enum | profile_completion / farm_data / other |
| district_id | UUID | FK to District |
| assigned_agent_id | UUID | nullable, FK to User (field-agent role) |
| farmer_id | UUID | nullable, FK to Farmer |
| status | enum | available / claimed / submitted / under_review / approved / rejected / clarification_requested / paid |
| payout_amount | decimal | GHS, set on approval |

## Geographic Entities

**Region → District → Community** (hierarchical). Field agents and cash point agents are scoped to their assigned district.

### AggregationUnit
Fleet of vehicles + storage facilities assigned to a district. Each unit has its own capacity limit.

### StorageFacility
Physical storage. Has capacity. Fill percentage trackable.

## Audit Entities

### ChangeLog
Automatic capture of every INSERT/UPDATE/DELETE. Fields: table, record_id, operation, old_values, new_values, actor_id, timestamp. Append-only, immutable.

### BusinessEvent
Human-readable operational events. Fields: event_type, actor_id, entity_type, entity_id, description, metadata (JSON), occurred_at. Append-only, immutable.

**Event examples:** `aggregation_recorded`, `tally_verified`, `tally_disputed`, `voucher_approved`, `voucher_generated`, `voucher_redeemed`, `task_approved`, `farmer_registered`, `profile_completed`

## ID Strategy
All entities use **UUID v4** — generated client-side for offline support. Human-readable codes for vouchers (`TDX-V-XXXXX`).

## Currency
All monetary values in **GHS (Ghana Cedis)**.

## Weight Unit Standard
All commodity weights are recorded and displayed in **kilograms (kg)** only.
