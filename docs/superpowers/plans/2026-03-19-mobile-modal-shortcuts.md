# Mobile Modal And Shortcut Settings Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the annotation modal on mobile and add user-configurable newline/submit shortcuts with matching in-modal guidance.

**Architecture:** Keep the plugin as a single main entry, but extract shortcut parsing/formatting into a small pure helper module so behavior can be tested outside Obsidian. Apply mobile modal improvements with focused CSS and minimal DOM changes in the existing modal renderer.

**Tech Stack:** TypeScript, Obsidian plugin API, esbuild, Node test runner via temporary `tsc` compilation

---

### Task 1: Add Shortcut Helper Tests

**Files:**
- Create: `tests/modal-shortcuts.test.ts`
- Test: `tests/modal-shortcuts.test.ts`

- [ ] **Step 1: Write failing test**

Add tests for:
- default hint text when submit shortcut is unset
- combined hint text when both shortcuts are configured
- matching keyboard events against Enter / Shift+Enter / Ctrl+Enter
- conflict normalization when newline and submit shortcuts are identical

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsc tests/modal-shortcuts.test.ts --module commonjs --target es2020 --outDir .tmp-tests`
Expected: FAIL because the helper module does not exist yet.

### Task 2: Implement Configurable Modal Shortcuts

**Files:**
- Create: `modal-shortcuts.ts`
- Modify: `main.ts`
- Test: `tests/modal-shortcuts.test.ts`

- [ ] **Step 1: Write minimal helper implementation**

Implement:
- shortcut option types
- label formatting for settings and modal hints
- key event matching
- settings normalization to avoid conflicting shortcuts

- [ ] **Step 2: Wire plugin settings and modal behavior**

Update:
- settings type/defaults
- localized strings
- settings tab dropdowns
- modal key handling and hint rendering

- [ ] **Step 3: Run tests to verify they pass**

Run:
- `npx tsc tests/modal-shortcuts.test.ts modal-shortcuts.ts --module commonjs --target es2020 --outDir .tmp-tests`
- `node --test .tmp-tests/tests/modal-shortcuts.test.js`

Expected: PASS

### Task 3: Improve Mobile Modal Layout

**Files:**
- Modify: `main.ts`
- Modify: `styles.css`

- [ ] **Step 1: Update modal DOM structure only where needed**

Make sure the existing button container and header structure can be laid out responsively without changing desktop behavior unnecessarily.

- [ ] **Step 2: Add mobile-specific CSS**

Adjust:
- modal width on narrow viewports
- header/title wrapping
- textarea minimum height
- single-row color dots on mobile
- single-row cancel/confirm buttons on mobile

- [ ] **Step 3: Run verification**

Run:
- `npx tsc tests/modal-shortcuts.test.ts modal-shortcuts.ts --module commonjs --target es2020 --outDir .tmp-tests`
- `node --test .tmp-tests/tests/modal-shortcuts.test.js`
- `npm run build`

Expected: PASS
