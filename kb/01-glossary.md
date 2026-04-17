# TDX Glossary

| Term | Definition |
|------|-----------|
| **TDX Platform** | Digital infrastructure for collecting, purchasing, moving, and reselling agricultural commodities from smallholder farmers. |
| **Farmer** | Agricultural producer supplying commodities into TDX. Identified at aggregation point with minimum info (name + community). |
| **Aggregation** | Process of receiving commodities from a farmer, verifying weight in kg, and recording the transaction. All three steps required. |
| **Aggregation Unit** | Operational fleet of vehicles (trucks/tricycles) + storage (silos/warehouses) working together in a session. Not a single asset. |
| **Aggregation Session** | Active sourcing period for an aggregation unit. Can be created, activated, paused, or closed. |
| **Aggregation Transaction** | Single farmer supply event within a session — records commodity, weight in kg, farmer, agent. |
| **Aggregated Inventory** | Commodity received, verified, and recorded but not yet released for trade. |
| **Field Agent** | Onboards new farmers and completes incomplete farmer profiles. Paid per completed task. Single responsibility — no commodity capture. |
| **Aggregator** | Community-based field operator who creates commitments, records farmer breakdowns at loading, and captures aggregation data. Does not register farmers. |
| **Sourcing Officer** | Rides with aggregation unit, independently verifies weight in kg using tally calculator. Compares tally against system total. |
| **Cash Point Agent** | Authorized payment provider who validates farmer vouchers and triggers MTN MoMo payouts. |
| **Cash-Out Voucher** | Payment artifact generated after aggregation approval — contains a unique code (e.g., TDX-V-8A3F2K) that the farmer takes to a Cash Point Agent. |
| **Commitment** | Aggregator's declaration that X kg of a commodity is available at a location for collection. |
| **Farmer Breakdown** | Record of which farmer contributed how many kilograms within a commitment at loading. |
| **Tally Verification** | Two-party weight verification — sourcing officer's independent tally in kg compared against agent's recorded weight in kg. |
| **District** | Geographic operational area. Agents and Cash Point Agents are scoped to their assigned district. |
| **Silo / Warehouse** | Physical storage facility where aggregated commodities are stored. |
| **MTN MoMo** | MTN Mobile Money — primary payment rail in Ghana. Phone number = bank account. |
| **GHS** | Ghana Cedis — currency used across the platform. |
| **Agent Task** | Discrete work item assigned to a field agent (e.g., complete a farmer profile). Available → Claimed → Submitted → Approved → Paid. |
