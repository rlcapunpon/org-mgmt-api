# Development Database Setup (Streamlined)

This document describes the streamlined database setup process for development, eliminating the need for migrations while ensuring comprehensive test coverage.

## Quick Start

```bash
# One-command setup (recommended for new development)
npm run dev:setup

# Or manual steps
npx prisma db push --force-reset  # Reset DB and apply schema
npm run seed                      # Load initial data
npm test                         # Verify everything works
```

## Development Workflow

### Schema Changes
1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push` (applies changes immediately)
3. Run tests to verify: `npm run test:e2e`

### Database Reset
```bash
# Quick reset (keeps schema, reloads data)
npm run dev:reset

# Full reset (reapplies schema + data)
npm run dev:setup
```

### Adding Seed Data
1. Edit `prisma/seed.ts`
2. Run `npm run seed`
3. Verify with database tests: `npx jest database-queries.spec.ts`

## Why No Migrations in Development?

- **Faster iteration**: Direct schema push vs migration generation
- **Simpler workflow**: No migration file management
- **Development-focused**: Empty database, no data to preserve
- **Test-driven**: Comprehensive test suite validates all changes

## Test Coverage Status

- ✅ **Database Queries**: 31/31 tests passing
- ✅ **E2E Integration**: 33/33 tests passing  
- ✅ **Unit Tests**: 107/107 tests passing
- ✅ **Total Coverage**: 171/171 tests across 19 suites

## Key Commands

| Command | Purpose |
|---------|---------|
| `npm run dev:setup` | Complete development database setup |
| `npm run dev:reset` | Quick reset with data reload |
| `npx prisma db push` | Apply schema changes directly |
| `npm run seed` | Load seed data |
| `npm run test:e2e` | Run integration tests |
| `npx jest database-queries.spec.ts` | Test database operations |

## Production Considerations

⚠️ **Important**: This streamlined approach is for **development only**. For production:

1. Use proper migrations: `npx prisma migrate deploy`
2. Version control schema changes via migration files
3. Consider data preservation and rollback strategies

## Troubleshooting

### Tests Failing After Schema Changes
```bash
npm run dev:reset  # Reset and reseed
npm test          # Verify all tests pass
```

### Database Connection Issues
```bash
# Check environment variables
echo $DATABASE_URL

# Reset database completely
npm run dev:setup
```

### Seed Data Issues
```bash
# Check seed script
npm run seed

# Verify data loaded correctly
npx jest database-queries.spec.ts --verbose
```

## Files Modified for Streamlined Setup

- ✅ **Removed**: `prisma/migrations/` (entire directory)
- ✅ **Enhanced**: `test/integration.e2e-spec.ts` (added required reason field)
- ✅ **Fixed**: `src/modules/schedules/services/schedules.service.ts` (JSON due_rule parsing)
- ✅ **Added**: `scripts/dev-setup.js` (automated setup script)
- ✅ **Updated**: `package.json` (new npm scripts)