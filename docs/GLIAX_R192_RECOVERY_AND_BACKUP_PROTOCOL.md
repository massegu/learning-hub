# GLIAX R19.2 — Recovery and backup protocol (2026-11-26)

## Known recovery point
- Repository: `massegu/learning-hub`
- Recovery branch: `recovery/gliax-r19-2-20261126`
- Baseline commit: `3c841ef9a4c59a1a70f831acba82a160c9f34459` (R19.2 specification; R19.1 in ancestry)
- Other existing backup: `reconstruccion/gliax-a-g-h` at `2073052e100df3fa8faa29cfaab1fdcb7868b090`.
- The **former R19.2 implementation**, including commit `3c7aef976f73af81b10127ed4fff4b5ac318d754`, has NOT been recovered. Do not use that SHA as a deployable source.

## Mandatory checkpoint rules
1. Before writing code, fetch and verify `origin/recovery/gliax-r19-2-20261126`. Work on a separate `rebuild/gliax-r192-<phase>` branch based on the current verified recovery head. NEVER work directly on `main`, `desarrollo`, or the published staging branch.
2. At the end of EACH small verified implementation milestone (no more than one independent family or cohesive change):
   - Run relevant tests; commit all intentional tracked source/test/doc files.
   - Verify `git status --short`, `git rev-parse HEAD`, `git show --stat --oneline HEAD`, `git fsck --no-reflogs`.
   - Push ONLY the reconstruction branch to GitHub with an explicit refspec and no forced updates. E.g. `git push origin HEAD:refs/heads/rebuild/gliax-r192-<phase>`.
   - Query the remote branch SHA and confirm it matches local HEAD. If push cannot be performed or remote SHA mismatches, STOP further coding; never accumulate unrecoverable local-only work.
   - Create an offline `git bundle` containing the full branch history, run `git bundle verify`, and copy the bundle to a user-controlled durable location (not merely `/workspace`). Check that the copy is accessible and matches its SHA-256 before proceeding. If a durable user-controlled location is unavailable, report that clearly; the verified GitHub branch is the primary checkpoint.
3. Never rely on a different Codex conversation/environment retaining worktrees, git objects, attachments, or temporary `/workspace` files.
4. Re-run `git status` after each phase; do not hide or silently discard untracked work. Do not push secrets, patient data, generated private reports or credentials. Run secret scanning / staged diff inspection before push.
5. Never create a PR, merge to `main`/`desarrollo`, publish to GitHub Pages/Cloudflare, or deploy to Supabase without a NEW, specific authorization.
6. Never claim a phase is complete until its code AND tests are committed AND its SHA verified on GitHub.
7. Before any Staging work, require an explicitly approved integrated commit plus verifiable matching Pages and Edge package manifests and a tested rollback path.

## Recovery scope
The missing implementation includes R19.2 architecture/banks CP, EC, IN, AR; legacy executive generators; navigation and icon integration; adaptive selector and diversity expansion; 5B QA corrections/tests. Reconstruct from the master specification and separately retained test/audit material; never fabricate historical commit hashes or claim binary equivalence with the lost implementation.

## Deployment triggers observed on main (2026-11-26)
`.github/workflows/publicar-beta.yml` push CI is limited to `main` and `desarrollo`; `.github/workflows/comprobar-token.yml` runs on schedule or manual dispatch. Staging and production deployment settings must be rechecked before any later remote operation; no deployment is authorized by this protocol.

## Stop and escalate
Stop if the exact base cannot be fetched, tests fail, the branch cannot be pushed and verified, or changes unexpectedly affect branches, workflows, domains, or deployed environments. Explain the blocking issue without spending further Codex quota repeating the same failed operations.
