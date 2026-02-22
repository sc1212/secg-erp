# SECG ERP Data Automation — Implementation Starter

This repo now includes first-pass scaffolding for the launch playbook:

## Added now
- `backend/api/documents.py`: Document Vault metadata API + system event emission.
- `backend/sync/scheduler.py`: recurring sync schedule registration stubs.
- `backend/sync/jobs.py`: centralized sync failure handling that creates `ExceptionItem` and `SystemEvent`.
- `scripts/migrate_quickbooks.py`: migration scaffold with mapping-file ingestion and dry-run support.
- `config/qb_customer_mapping.example.json` and `config/qb_account_mapping.example.json`: templates for Samuel's mapping inputs.
- `Integration` + `SyncLog` models in `backend/models/extended.py` for integration state and run history.

## Next implementation slices
1. Wire QuickBooks OAuth credentials and API client into `scripts/migrate_quickbooks.py`.
2. Replace scaffold vendor/project creation with actual QBO entity pulls and upsert logic.
3. Add `backend/api/imports.py` endpoint for CSV upload + validation preview.
4. Add migration scripts (Alembic) for `documents`, `system_events`, `integrations`, `sync_logs`, `cost_events`, and approval/exception updates.
5. Start scheduler in app startup only in non-test runtime.

## Samuel input files required immediately
- `config/qb_customer_mapping.json` (from the example template).
- `config/qb_account_mapping.json` (from the example template).
- Project master CSV and budget CSV exports.
