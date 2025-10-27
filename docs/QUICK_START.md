# Quick Start - Phase 1 Testing

Copy and paste these commands to test the Phase 1 implementation.

## Step 1: Verify Build (1 min)

```bash
npm run build
```

**Expected**: "✓ Compiled successfully" message with no errors.

## Step 2: Verify Linting (1 min)

```bash
npm run lint
```

**Expected**: No output (0 errors, 0 warnings).

## Step 3: Start Development Server (2 min)

```bash
npm run dev
```

**Expected**: Server starts on http://localhost:3000

**In another terminal, verify it's running:**

```bash
curl http://localhost:3000
```

## Step 4: Open in Browser (1 min)

Navigate to: http://localhost:3000

**Expected**:

- Page loads
- No console errors (F12 to check)
- Default Next.js template shows

## Step 5: Test Admin Route Protection (1 min)

Navigate to: http://localhost:3000/admin

**Expected**:

- Redirects to http://localhost:3000/admin/login (middleware working)
- Login form appears (admin page will show after configuration)

## All Tests Pass? ✅

If all above tests pass without errors, you're ready for:

1. **Manual Supabase Configuration** - See `SETUP.md`
2. **Full Verification** - See `PHASE_1_VERIFICATION.md`

---

## Troubleshooting Quick Reference

### Build fails

```bash
npm install
npm run build
```

### Lint errors

```bash
npm run lint
```

Review error output and check `src/types/database.ts` first.

### Dev server won't start

- Check port 3000 is free: `lsof -i :3000` (or `netstat -ano | findstr :3000` on Windows)
- Clear cache: `rm -rf .next/`
- Verify Node version: `node --version` (should be 18+)

### TypeScript errors

- Reload IDE
- Verify `.env.local` exists in project root
- Run `npm install` again

---

## Next Steps

✅ **Phase 1 Code**: Complete
⏳ **Phase 1 Setup**: Manual configuration in Supabase (see SETUP.md)
📋 **Phase 1 Verify**: Use PHASE_1_VERIFICATION.md checklist
🚀 **Phase 2**: Build public pages (start after Phase 1 complete)

---

**Total testing time**: ~5 minutes
**Continue to SETUP.md**: After all tests pass
