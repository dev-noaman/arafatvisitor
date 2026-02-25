# read/verification.md

## Before Marking Anything Done

- Never mark complete without proving it works
- Run tests, check logs, demonstrate correctness
- Ask: "Would a staff engineer approve this?"
- For non-trivial changes: diff behavior before and after
- For bug fixes: confirm root cause resolved, not just symptom
- For new code: confirm edge cases are handled

## Arafat VMS Specific Checks

- [ ] Visit response format — nested `visitor: { name, company, phone, email }`, NOT flat fields
- [ ] Field names — `expectedDate` not `visitDate`/`scheduledDate`/`expectedArrivalDate`
- [ ] Rate limiting — `@SkipThrottle()` with all three strategies if needed
- [ ] CORS — both `www` and non-www origins allowed
- [ ] Mobile API shapes — dashboard returns flat object, pending-approvals returns plain array
- [ ] Lookups — use `p.label` not `p.name`, returns `LookupItem[]` not wrapped object
- [ ] Admin list endpoints — nested `host: { name }`, not flat `hostName`
- [ ] Timer types — `ReturnType<typeof setTimeout>` in browser context
- [ ] Prisma generate — run after any schema change
- [ ] QR formats — support both `VMS-NNNNNN` and UUID patterns
- [ ] Types pass: `npx tsc --noEmit` (backend + mobile)

## Elegance Check

- "Is there a more elegant way?"
- "Am I solving the root cause or papering over it?"
- "Does this introduce new coupling or fragility?"
- "Would this be obvious to someone reading it cold?"

If a fix feels hacky → implement the elegant solution instead.
