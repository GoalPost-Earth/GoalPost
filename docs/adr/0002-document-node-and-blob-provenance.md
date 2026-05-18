# Document provenance via new Document node + blob storage + EXTRACTED_FROM edges

Document ingestion (see ADR-0001) creates Persons and FieldPulses in a FieldContext from an uploaded file. We considered three lighter alternatives — no provenance at all (extracted entities indistinguishable from manually-created ones), provenance only in `Log.metadata`, and provenance only as text inside the ConversationThread. We instead introduced a first-class `Document` node attached to the FieldContext via `HAS_DOCUMENT`, with the original file persisted in blob storage (Vercel Blob or equivalent) and each approved entity carrying an `EXTRACTED_FROM` edge to the Document.

## Why

- **Re-extractability.** "Re-extract on this Document" requires the original file to still exist. Throwing it away after the chat turn forecloses on retry, prompt tuning, and model upgrades.
- **Audit answerable from the graph.** A user asking "where did Sarah Chen come from in this FieldContext?" gets answered by following `EXTRACTED_FROM`, not by grepping through chat threads or activity logs.
- **Avoids overloading Log.** The existing `Log` node records mutations, not file storage. Stuffing `documentId` / `blobUrl` into `Log.metadata` would couple two unrelated concepts and make "list all entities from this doc" awkward.

## Consequences

- Blob storage becomes a first-class dependency in what was otherwise a pure Neo4j + GraphQL stack. New env vars, new failure modes, new cleanup story (orphaned blobs when Documents are deleted).
- `Document` needs a GraphQL type with an `@authorization` directive that inherits from the parent Space — read access via owner-of-MeSpace OR member-of-WeSpace, same pattern as `FieldContext`.
- `EXTRACTED_FROM` becomes load-bearing: removing or renaming it is a graph migration. Treat it as part of the entity contract.
- Documents are never auto-deleted, even on full-rejection of extracted entities. Cleanup is user-driven via a manual delete on the Document.
