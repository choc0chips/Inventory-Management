# StockWise Sample Import Files

CSV files for testing the import system at `/import`. All valid files use the exact column order required by `CSV_IMPORT_HEADERS` in `lib/validators.ts`.

## Files

| File | Purpose |
|------|---------|
| `sample-import-valid.csv` | 20 realistic rows — TRADING, ASSET, CONSUMABLE; PURCHASE, SALE, RESTOCK, RETURN, ADJUSTMENT |
| `sample-import-invalid.csv` | Row-level validation errors (empty SKU, invalid enums, bad date, formula injection, zero adjustment, negative sale qty) |
| `sample-import-invalid-structure.csv` | Header row missing `date` column (structure validation failure; no data rows) |
| `sample-import-existing-products.csv` | Uses seed SKUs (`ELEC-SPK-001`, etc.) to test movements on existing products |
| `sample-import-new-products.csv` | New SKUs, categories (`Packaging`, `Safety Gear`), and suppliers |

## Notes

- **PURCHASE** is accepted in CSV and stored as **RESTOCK** in the database.
- **ADJUSTMENT** may use negative `quantity` for stock reductions.
- **Negative stock** at processing time (e.g. large SALE on low stock) is rejected per row during import, not at CSV validation.
- Run `npm run test` to validate parsing logic against these patterns.

## Validate a file locally

```bash
npm run test
```

Then upload via **Import** in the app while logged in.
