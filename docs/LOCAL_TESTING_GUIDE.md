# Local Testing Guide

Before committing and moving forward, test the implementation locally to ensure everything is working properly.

## Pre-Testing Checklist

- [ ] All files created and in place
- [ ] Build succeeds without errors
- [ ] Dev server starts without errors

## Step 1: Verify Build

```bash
npm run build
```

**Expected Output**:

- "Compiled successfully" message
- No TypeScript errors
- Build artifacts created in `.next/`

**If it fails**:

- Check for TypeScript errors in the output
- Verify all imports use the correct paths (@/lib/\*, etc.)
- Ensure .gitignore is properly configured

---

## Step 2: Start Development Server

```bash
npm run dev
```

**Expected Output**:

- Server running on http://localhost:3000
- No errors in console
- Message about Turbopack compilation

**If it fails**:

- Check for missing environment variables
- Verify .env.local exists and is readable
- Check for port conflicts (port 3000 already in use)

---

## Step 3: Open in Browser

Navigate to `http://localhost:3000`

**Expected Behavior**:

- Home page loads without errors
- Page displays the default Next.js template content
- No console errors (F12 to open developer tools)

---

## Step 4: Test File Structure

Verify the folder structure is correct:

```bash
# In project root, run:
ls -la src/
```

Should show:

```
drwxr-xr-x app/
drwxr-xr-x components/
drwxr-xr-x context/
drwxr-xr-x hooks/
drwxr-xr-x lib/
drwxr-xr-x styles/
drwxr-xr-x types/
-rw-r--r-- middleware.ts
```

---

## Step 5: Verify Key Files Exist

```bash
# Check Supabase clients
ls -la src/lib/supabase/

# Check types
ls -la src/types/

# Check migration
ls -la src/lib/db/migrations/
```

Should show:

```
src/lib/supabase/
  - client.ts
  - server.ts

src/types/
  - cart.ts
  - database.ts
  - index.ts
  - order.ts

src/lib/db/migrations/
  - 001_initial_schema.sql
```

---

## Step 6: Test TypeScript Compilation

```bash
npm run build
```

All TypeScript should compile without errors. If you see errors:

1. **Path alias errors**: Verify tsconfig.json has @/ aliases
2. **Missing imports**: Check that imports use correct paths
3. **Type errors**: Review console output for specific issues

---

## Step 7: Documentation Review

Verify documentation files exist:

```bash
ls -la *.md
```

Should show:

- README.md ✓
- SETUP.md ✓
- PHASE_1_SUMMARY.md ✓
- PHASE_1_VERIFICATION.md ✓
- IMPLEMENTATION_COMPLETE.md ✓
- LOCAL_TESTING_GUIDE.md ✓

---

## Step 8: Git Status Check

```bash
git status
```

Should show:

```
Changes not staged for commit:
  modified: tsconfig.json
  modified: package-lock.json
  modified: package.json
  (removed old app/ files - expected)

Untracked files:
  src/
  SETUP.md
  PHASE_1_SUMMARY.md
  PHASE_1_VERIFICATION.md
  IMPLEMENTATION_COMPLETE.md
  LOCAL_TESTING_GUIDE.md
```

---

## Troubleshooting

### Build Fails with "Cannot find module"

**Solution**:

```bash
npm install
npm run build
```

### Dev server won't start

**Possible causes**:

- Port 3000 already in use
- Node version mismatch
- Environment variables missing

**Solution**:

```bash
# Check Node version
node --version  # Should be 18+

# Clear cache
rm -rf .next/
npm run dev
```

### TypeScript errors in IDE

**Solution**:

- Reload the IDE
- Verify tsconfig.json has correct paths
- Run `npm install` to install @types packages

### Missing .env.local

**Solution**:

- Verify .env.local exists in project root
- Contains all required variables from .env.example
- Not listed in git (should be in .gitignore)

---

## What's NOT Tested Yet

These require manual Supabase configuration (after local testing):

- [ ] Database connectivity
- [ ] Admin login
- [ ] RLS policies
- [ ] Storage buckets
- [ ] Stripe integration

See SETUP.md for those steps.

---

## Next Steps After Testing

If all tests pass:

1. **Commit the code**:

    ```bash
    git add -A
    git commit -m "Phase 1: Complete project foundation and setup"
    ```

2. **Follow SETUP.md** to configure Supabase

3. **Run PHASE_1_VERIFICATION.md** checklist

4. **Proceed to Phase 2** when all verification items are complete

---

## Success Criteria

Phase 1 local testing is complete when:

✅ `npm run build` succeeds
✅ `npm run dev` starts without errors
✅ Home page loads at http://localhost:3000
✅ No TypeScript errors in console
✅ All source files in place
✅ All documentation created
✅ Git status shows expected changes

---

**Questions?** See SETUP.md for more detailed troubleshooting.

**Ready?** Proceed to SETUP.md for Supabase configuration!
