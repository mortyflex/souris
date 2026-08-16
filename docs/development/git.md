# Souris — Git Workflow

## 1. Purpose

This document defines the Git workflow used by Souris.

It is the canonical reference for:

- commit conventions;
- commit scopes;
- emojis;
- staging discipline;
- branch expectations;
- push workflow;
- documentation commits;
- feature commits;
- fixes;
- tests;
- refactors;
- generated files;
- definition of a clean Git state.

The goal is to maintain a Git history that remains understandable months or years later.

Every development phase must end in a known, committed, and pushed state before the next phase begins.

---

## 2. Core Rule

Every completed development step follows this sequence:

```text
work
↓
verification
↓
tests
↓
git status
↓
review diff
↓
stage relevant files
↓
commit
↓
push
↓
verify clean working tree
```

Do not begin the next project step before the current step has been committed and pushed.

---

## 3. Main Branch

The primary branch is:

```text
main
```

During the initial solo-development phase, small controlled project steps may be committed directly to `main`.

This workflow is intentional while:

- one developer owns the project;
- changes are small;
- each phase is reviewed before committing;
- commits remain atomic;
- the application is not yet maintained by a larger team.

A more advanced branching model may be introduced later if required.

---

## 4. Remote Repository

The canonical remote repository is hosted on GitHub.

The expected remote name is:

```text
origin
```

After every completed project step, local work must be pushed to GitHub.

A local commit that has not been pushed does not count as a completed Souris project step.

---

## 5. Conventional Commits

All Souris commits use Conventional Commits.

The basic format is:

```text
<type>(<scope>): <emoji> <description>
```

Example:

```text
feat(scheduling): ✨ add appointment timeline calculation
```

A scope is recommended whenever it makes the affected area clearer.

---

## 6. Allowed Commit Types

The primary commit types are:

```text
feat
fix
docs
test
refactor
style
perf
chore
build
ci
revert
```

Use the narrowest type that correctly describes the change.

---

## 7. `feat`

Use:

```text
feat
```

when introducing new user-facing or business functionality.

Examples:

```text
feat(agenda): ✨ add day timeline view

feat(clients): ✨ add client creation flow

feat(products): ✨ add barcode product lookup

feat(scheduling): ✨ add free-slot calculation
```

Do not use `feat` for documentation or infrastructure-only changes.

---

## 8. `fix`

Use:

```text
fix
```

when correcting incorrect behavior.

Examples:

```text
fix(scheduling): 🐛 prevent overlapping occupied phases

fix(products): 🐛 prevent negative stock after sale

fix(agenda): 🐛 align processing block with timeline
```

A fix should clearly identify what was incorrect.

Avoid:

```text
fix: 🐛 fixes
```

---

## 9. `docs`

Use:

```text
docs
```

for documentation-only changes.

Examples:

```text
docs(architecture): 🏗️ define project architecture

docs(scheduling): 📅 define appointment domain rules

docs(clients): 👤 define client domain rules

docs(products): 📦 define product and inventory domain

docs(sales): 💳 define retail sales domain
```

Documentation changes that accompany code changes do not necessarily require a separate commit.

If documentation and implementation represent one logical change, they may belong in the same commit.

---

## 10. `test`

Use:

```text
test
```

when adding or modifying tests without changing production behavior.

Examples:

```text
test(scheduling): ✅ cover overlapping appointments

test(products): ✅ cover stock movement calculations

test(clients): ✅ cover visit frequency calculation
```

---

## 11. `refactor`

Use:

```text
refactor
```

when changing implementation structure without intentionally changing external behavior.

Examples:

```text
refactor(scheduling): ♻️ extract occupied range calculation

refactor(products): ♻️ simplify stock movement model
```

Do not use `refactor` to hide feature work or bug fixes.

---

## 12. `style`

Use:

```text
style
```

only for changes that affect code formatting or visual presentation without changing business behavior.

Examples:

```text
style(agenda): 💄 refine appointment card spacing

style(ui): 💄 align button radii with design system
```

For significant user-facing UI functionality, prefer `feat`.

---

## 13. `perf`

Use:

```text
perf
```

for measurable performance improvements.

Example:

```text
perf(agenda): ⚡ reduce timeline rendering work
```

Do not use `perf` without a real performance-related reason.

---

## 14. `chore`

Use:

```text
chore
```

for repository maintenance and non-feature project work.

Examples:

```text
chore: 🚀 initialize Souris project

chore(design): 🎨 add visual references

chore(deps): ⬆️ update development dependencies
```

---

## 15. `build`

Use:

```text
build
```

for build-system or dependency changes that directly affect application building.

Examples:

```text
build(pwa): 📦 configure production manifest

build: 📦 update build configuration
```

---

## 16. `ci`

Use:

```text
ci
```

for CI/CD configuration.

Examples:

```text
ci(github): 👷 add test workflow

ci(visual): 👷 add visual regression workflow
```

---

## 17. Emoji Convention

Souris commits include one meaningful emoji after the colon.

The emoji supplements the Conventional Commit type.

It does not replace it.

Preferred mappings include:

```text
✨ feature
🐛 bug fix
📝 documentation
✅ tests
♻️ refactor
💄 UI/style
⚡ performance
🎨 design assets/design-system work
🏗️ architecture
📅 scheduling
👤 clients
📦 products/inventory
💳 sales
🔐 authentication/security
🔧 configuration
⬆️ dependency upgrade
⬇️ dependency downgrade
🔥 removal
🚀 initialization/release/setup milestone
👷 CI
🚨 lint warnings/errors
🔒 security fix
💾 persistence/database
📱 responsive/mobile
🖥️ desktop
♿ accessibility
🌐 internationalization
```

The emoji should remain meaningful to the change.

Do not add multiple decorative emojis to one commit.

---

## 18. Commit Description

The description must be:

- concise;
- imperative or action-oriented;
- specific;
- lowercase after the emoji unless a proper noun requires capitalization.

Prefer:

```text
feat(products): ✨ add barcode scanner flow
```

Avoid:

```text
feat(products): ✨ Added some product stuff
```

Avoid vague words such as:

```text
update
changes
stuff
misc
various fixes
work
progress
```

---

## 19. Scope

The scope identifies the area most affected.

Typical Souris scopes include:

```text
architecture
agents
scheduling
agenda
appointments
clients
products
inventory
sales
auth
ui
design
responsive
motion
pwa
database
storage
testing
ci
deps
```

Scopes should remain stable and understandable.

Do not invent highly specific one-off scopes when an existing domain scope is sufficient.

---

## 20. Atomic Commits

A commit should represent one coherent project change.

Good:

```text
docs(clients): 👤 define client domain rules
```

Bad:

```text
docs: 📝 add client rules, install animation library, fix CSS and update products
```

Unrelated changes should be separated.

This makes:

- history easier to read;
- reverts safer;
- debugging easier;
- agent work easier to audit.

---

## 21. Project-Step Commits

The Souris workflow deliberately uses small development steps.

A step should normally produce one commit.

Example:

```text
Step 2.5
Define appointment domain

Commit:
docs(scheduling): 📅 define appointment domain rules
```

Do not accumulate several completed Souris steps into one large commit.

---

## 22. Verification Before Commit

Before committing code, inspect:

```bash
git status
```

and:

```bash
git diff
```

When staged content exists, inspect when useful:

```bash
git diff --staged
```

The developer or agent must understand what is being committed.

Do not blindly run:

```bash
git add .
```

without checking repository state first.

---

## 23. Staging

Prefer staging the files relevant to the current step explicitly.

Example:

```bash
git add docs/domain/appointments.md
```

This makes accidental unrelated commits less likely.

Using:

```bash
git add .
```

is acceptable only after verifying that all current changes belong to the same logical commit.

---

## 24. Tests Before Commit

When production code is affected, relevant checks must pass before the commit.

Depending on the current project maturity, these may include:

```text
lint
type checking
unit tests
integration tests
build
visual tests
end-to-end tests
```

The exact testing requirements are defined in:

```text
docs/development/testing.md
```

Documentation-only commits do not require application tests unless the documentation change accompanies implementation changes.

---

## 25. Push After Commit

Every completed project-step commit must be pushed.

Expected command:

```bash
git push
```

Do not leave completed Souris phases only on the local machine.

GitHub is the remote source of project history.

---

## 26. Clean Working Tree

After pushing a completed step, run:

```bash
git status
```

The expected state is:

```text
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

The next step should begin from a clean repository unless there is an explicit reason not to.

---

## 27. Do Not Rewrite Shared History Casually

Once a commit has been pushed, do not casually rewrite it using:

```text
git push --force
```

or aggressive history rewriting.

If a pushed change needs correction, prefer a new corrective commit.

History rewriting may be considered only when there is a clear reason and the consequences are understood.

---

## 28. Secrets

Secrets must never be committed.

Examples include:

```text
Supabase service-role keys
private API keys
access tokens
database passwords
private certificates
```

Environment files containing secrets must remain ignored appropriately.

Before introducing new environment configuration, verify `.gitignore`.

---

## 29. `.env` Files

Local secret configuration should use environment files appropriate to Next.js and the future infrastructure.

Do not commit secret values.

If documentation of required environment variables becomes useful, provide a safe example file containing placeholder values only.

Example:

```text
.env.example
```

must never contain real credentials.

---

## 30. Generated Files

Generated files should be committed only when they are intended to be part of the repository.

Examples may include:

```text
generated database types
visual snapshots
migration files
lockfiles
```

Temporary build output must remain ignored.

Do not commit:

```text
.next/
node_modules/
temporary screenshots
local debug files
```

unless a later workflow explicitly requires a specific generated artifact.

---

## 31. Lockfile

Souris uses Bun.

The Bun lockfile is:

```text
bun.lock
```

It is version-controlled.

Dependency changes that modify the lockfile must include the relevant lockfile change in the same commit.

---

## 32. Dependency Changes

Do not add dependencies casually.

Before adding a package, verify:

- the functionality is genuinely needed;
- an existing dependency does not already solve it;
- the package is maintained;
- the package fits the project architecture.

A dependency addition should belong to the logical feature or setup commit that requires it.

Large dependency changes may receive their own commit.

---

## 33. Dependency Upgrade Commit

A dependency-only upgrade may use:

```text
chore(deps): ⬆️ update dependencies
```

If the upgrade requires meaningful code migration, the commit message should reflect the actual work.

---

## 34. Documentation and Code

When implementation changes an architectural or domain rule, update the relevant documentation in the same logical change.

Example:

If the appointment engine gains configurable processing buffers and this changes a documented scheduling rule, update:

```text
docs/domain/appointments.md
```

with the implementation.

Do not allow documentation and code to drift apart.

---

## 35. Design Changes

When approved visual references change, commit the updated references with an explicit design-oriented message.

Example:

```text
chore(design): 🎨 update agenda visual references
```

If implementation changes to follow the new reference, those changes may be committed separately so the design decision and implementation remain independently visible.

---

## 36. Pixel-Perfect Fixes

Small visual corrections should still receive descriptive commits.

Prefer:

```text
style(agenda): 💄 match appointment spacing to reference
```

or:

```text
fix(agenda): 🐛 correct processing block position
```

depending on whether the issue is purely visual or behaviorally incorrect.

Avoid:

```text
fix: 🐛 pixel perfect
```

---

## 37. Refactoring Before Features

Do not perform unrelated refactoring while implementing a feature unless it is required.

If significant refactoring is necessary:

1. consider a separate refactor commit;
2. keep behavior unchanged;
3. verify tests;
4. then implement the feature.

This keeps feature diffs easier to audit.

---

## 38. Temporary Code

Do not commit temporary debugging code such as:

```text
console.log
debug buttons
temporary mock pages
commented-out experiments
```

unless the temporary artifact is intentionally part of a documented development tool.

Before committing, remove obsolete debug code.

---

## 39. Comments

Do not commit large commented-out implementations.

Git already preserves history.

Delete dead code.

If an implementation may be needed later, retrieve it from Git rather than keeping inactive code inside production files.

---

## 40. Commit Examples

### Architecture

```text
docs(architecture): 🏗️ define project architecture
```

### Agent rules

```text
docs(agents): 🤖 define project rules
```

### Scheduling documentation

```text
docs(scheduling): 📅 define appointment domain rules
```

### Client documentation

```text
docs(clients): 👤 define client domain rules
```

### Product documentation

```text
docs(products): 📦 define product and inventory domain
```

### Sales documentation

```text
docs(sales): 💳 define retail sales domain
```

### Scheduling implementation

```text
feat(scheduling): ✨ add appointment timeline engine
```

### Scheduling tests

```text
test(scheduling): ✅ cover processing-time overlaps
```

### UI implementation

```text
feat(agenda): ✨ add mobile agenda timeline
```

### Pixel-perfect correction

```text
style(agenda): 💄 align agenda with mobile reference
```

### Responsive implementation

```text
feat(responsive): 📱 add tablet agenda layout
```

### Authentication

```text
feat(auth): 🔐 add business owner login
```

### Database

```text
feat(database): 💾 add appointment persistence schema
```

### PWA

```text
feat(pwa): 📱 add installable app manifest
```

---

## 41. Agent Git Behavior

Coding agents working on Souris must:

1. inspect repository state before making assumptions;
2. never discard existing uncommitted user work;
3. never reset files unrelated to their task;
4. run relevant checks before claiming completion;
5. clearly report modified files;
6. provide the exact recommended commit message;
7. avoid committing automatically unless explicitly instructed;
8. never force-push without explicit instruction.

The human developer remains in control of repository history.

---

## 42. One Step at a Time

The Souris development workflow intentionally proceeds phase by phase.

At the end of each step:

```text
verify
test
commit
push
stop
```

The next step begins only after the previous step is confirmed as committed.

This rule exists to maintain a recoverable and auditable project state throughout development.

---

## 43. Final Rule

Git history is part of the quality of Souris.

A good commit should allow a future developer to understand:

```text
what changed
where it changed
why that category of change occurred
```

without opening every file.

Keep commits small, specific, conventional, and pushed.
