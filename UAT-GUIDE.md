# GoalPost — End-to-End UAT Guide (Dev Platform)

**Audience:** A tester (technical or non-technical) validating GoalPost on the **dev** environment before promotion.
**Goal:** Exercise every major user-facing workflow at least once, confirm it behaves as specified, and capture defects with enough detail to reproduce.

> GoalPost is a community-first, privacy-respecting platform for mutual aid, collective sense-making, and relational depth. Users capture **pulses** (goals, resources, stories, care, values) inside **FieldContexts**, which live inside **Spaces** (a private **MeSpace** or a collaborative **WeSpace**). An AI assistant helps capture pulses and surface **resonances** — semantic connections between contributions.

---

## 1. Before You Start

### 1.1 What you need

| Item | Detail |
| --- | --- |
| **Dev URL** | `https://dev.goalpost.earth` (or the preview URL you were given). All steps below assume this base. |
| **An invite** | **Access is invite-only — there is no public sign-up.** To get in, **email the GoalPost team to request an invite** for your tester address. You'll receive an invite email; accept it to create your account. |
| **Browser** | Latest Chrome or Edge (primary). Note the version you test on. |
| **Two email inboxes** | You'll test with **two separate invited accounts** (for collaboration + privacy checks). Request an invite for **each** address from the team. Use real inboxes you can open (invite/reset emails are sent via Resend). Gmail "+aliases" (e.g. `you+uat1@gmail.com`) work well. |
| **Test files** | A small `.txt` or `.md` file (a few paragraphs), a 1–3 page `.pdf`, and a small `.csv` and `.xlsx` for the import tests. |
| **Screen recorder / screenshot tool** | For attaching evidence to defects. |
| **Two viewports** | Test at **desktop** (≥1280px) and **mobile** (resize to **390 × 844**, e.g. iPhone 12). Several checks below are mobile-specific. |

### 1.2 Accounts you'll create

| Alias | Role in testing |
| --- | --- |
| **User A** | Primary user (invited by the team). Owns a MeSpace, creates a WeSpace, invites User B. |
| **User B** | Secondary user (invited by the team). Joins User A's WeSpace and contributes. |

> Both accounts come from team invites — **email the GoalPost team to request an invite for each address before you begin.**

### 1.3 Important environment notes (read these first)

- **Resonance discovery now runs on demand — you don't have to wait for a cron.** Uploading a document into a FieldContext automatically runs resonance discovery for that field, and every field's **Resonances** section has a **Discover** button you can click yourself to run it (see §K). Discovery is AI-backed (embeddings + LLM), so allow a short wait — a few seconds up to ~2 minutes — after an upload or after clicking **Discover**. A daily background job also exists as a backstop. Only if discovery still returns nothing **after clicking Discover and waiting** should you mark it **Blocked** and flag the dev team.
- **Other background work can lag.** Embedding generation and person enrichment run behind the scenes; some derived data (e.g. search relevance) may take a little time to catch up after you create content.
- **AI calls cost money and can be slow.** Assistant replies and document extraction call OpenAI/Gemini. Expect a few seconds of latency; a spinner is normal.
- **No raw IDs should ever be visible.** The AI assistant must never show internal IDs (`me_…`, `ws_…`, `ctx_…`, `pulse_…`, person UUIDs) or internal artifacts (`__typename`, hashes). If you see one in assistant output, that's a defect — log it.
- **Data sovereignty is the core promise.** Throughout testing, confirm User B **cannot** see User A's private MeSpace content, and vice versa.

### 1.4 How to log a defect

**Submit every defect through the GoalPost bug-report form:**

➡️ **https://clientos.thecodefoundry.dev/r/06a9dc4f76fe47a98a3512a037b74e74ead02a72157e478daef75002911f8dba**

Submit a **separate form entry for each issue** (don't batch several bugs into one). Before you open the form, gather the details below so you can fill it in quickly and the team can reproduce without follow-up:

```
- UAT-ID (e.g. UAT-E3) + short title
- Severity: Blocker / Major / Minor / Cosmetic
- Account used: User A / User B (and which email)
- Device / Viewport: Desktop 1440 / Mobile 390
- Theme: Light / Dark
- Steps to reproduce: 1… 2… 3…
- Expected result: …
- Actual result: …
- Console errors (F12 → Console): …
- Screenshot or screen recording (attach in the form)
```

> Keep the local **Defect Log** table in §3 as a running index of what you've filed, so the sign-off summary stays complete even though the canonical record lives in the bug-report system above.

### 1.5 Severity guide

- **Blocker** — cannot proceed; core flow broken (can't accept an invite / log in, can't create a pulse).
- **Major** — feature broken or wrong, but a workaround exists.
- **Minor** — wrong behavior with low impact.
- **Cosmetic** — visual/copy issue, no functional impact.

---

## 2. Test Coverage Map

| # | Area | Workflow |
| --- | --- | --- |
| A | Authentication & account | Invite acceptance, login, logout, password reset |
| B | Onboarding | Guided tour for new users |
| C | App shell / Studio | Header, navigation, theme, chat layout, notifications |
| D | MeSpace | Auto-created personal space, FieldContexts |
| E | Pulses | Create/edit Goal, Resource, Story, Care, Core Value pulses |
| F | AI Assistant | Modes, conversation, capture pulse via chat (HITL approval) |
| G | Canvas views | Dashboard / Graph / Bloom exploration |
| H | WeSpace collaboration | Create WeSpace, invite member, roles, shared pulses |
| I | Document ingestion | Upload `.txt`/`.md`/`.pdf` to a FieldContext, auto-extraction |
| J | Data import | CSV / XLSX import; bulk **Import articles** into a FieldContext (Upload dropdown) |
| K | Resonance review | Run discovery (on upload / Discover button); accept/decline suggestions, incl. bulk accept-by-confidence |
| L | Search | Semantic search across pulses, people, resonances |
| M | Profile & Settings | Edit profile, settings dialog |
| N | Authorization / privacy | Cross-account isolation |
| O | Cross-cutting | Responsive (390px), light/dark parity, console hygiene |

Run them roughly in order — later sections depend on data created earlier.

---

## A. Authentication & Account

> **Access is invite-only — there is no public sign-up.** Don't expect a "Sign up" page; if you land on one or can self-register, that itself is a defect to report (sign-up is being removed). Accounts are created by accepting a team invite.

### UAT-A1 — Accept invite & create account (User A)
**Pre:** You've **emailed the team to request an invite** for User A's address and received the invite email.
1. Open the invite email and click the invite link (lands on `/auth/accept-invite`).
2. Complete the prompted details (e.g. name, set a password) and finish.

**Expected:**
- Account is created and you're signed in (redirected into the app — onboarding tour or `/protected`).
- A **MeSpace is automatically created** for you (you'll confirm in section D).
- No console errors; no raw IDs shown anywhere.

☐ Pass ☐ Fail — Notes:

### UAT-A2 — No public sign-up
1. Try to reach a registration page directly (e.g. `/auth/signup`) or look for a "Sign up / Create account" link on the login page.

**Expected:** There is no usable public sign-up — the route is gone/redirects, and login offers no self-registration. (If you can create an account without an invite, log it.)

☐ Pass ☐ Fail — Notes:

### UAT-A3 — Invalid / used invite link
1. Try opening an obviously invalid invite link, and (if possible) re-open User A's invite link **after** it was already accepted.

**Expected:** A clear "invalid or expired invite" style message; no second/duplicate account created; no crash.

☐ Pass ☐ Fail — Notes:

### UAT-A4 — Logout & login
1. Open the **avatar menu** (top-right) → **Logout** → confirm in the dialog.
2. You should land on a public/login page.
3. Go to `/auth/login`, sign in with User A's credentials.

**Expected:** Logout clears the session (visiting `/protected/*` while logged out redirects to login). Login succeeds and restores your data.

☐ Pass ☐ Fail — Notes:

### UAT-A5 — Wrong password
1. Log out, attempt login with a wrong password.

**Expected:** Clear error; no session granted; password not echoed anywhere.

☐ Pass ☐ Fail — Notes:

### UAT-A6 — Password reset
1. `/auth/forgot-password` → enter User A's email → submit.
2. Open the inbox, click the reset link → set a new password at `/auth/reset-password`.
3. Log in with the **new** password.

**Expected:** Email arrives (check spam); link works; old password no longer works; new one does.

☐ Pass ☐ Fail — Notes:

### UAT-A7 — Protected route guard
1. While logged out, paste `/protected/dashboard` into the address bar.

**Expected:** Redirected to login, not shown protected content.

☐ Pass ☐ Fail — Notes:

---

## B. Onboarding Tour

### UAT-B1 — Guided tour for a new user
**Pre:** Use the newly invited User A account (or any account that hasn't completed onboarding yet).
1. Trigger/observe the onboarding tour (it surfaces for new users).
2. Step through each card: Welcome → Spaces intro → Fields → Pulses → WeSpaces → WeSpace fields → Create WeSpace → Dashboard → Settings access → "You're All Set!".

**Expected:**
- ~10 steps, each with a title + description; the highlight/spotlight points at the right element (e.g. the MeSpace button, the Create WeSpace button, the avatar/user menu).
- Navigation between steps works (next/back); a skip option is available.
- Final step has a "Start Exploring" action.

☐ Pass ☐ Fail — Notes:

### UAT-B2 — Skip and persistence
1. Start the tour and **skip** it.
2. Reload the app.

**Expected:** Tour does not aggressively re-appear after being completed/skipped (onboarding state persists).

☐ Pass ☐ Fail — Notes:

---

## C. App Shell (Studio)

The app is a "Studio": a glass header on top, a **canvas** (left/main) for content, and an **AI chat** surface (docked to the side or floating).

### UAT-C1 — Header controls
1. Inspect the top header.

**Expected to see:** GoalPost logo (links home), a **search** input, a **notifications** bell, a **chat layout** toggle (dock ↔ floating), a **theme** toggle (sun/moon), and the **avatar/user** menu.

☐ Pass ☐ Fail — Notes:

### UAT-C2 — Theme toggle (light/dark parity)
1. Click the sun/moon toggle. Flip to dark, then back to light.
2. Reload — theme preference should persist.

**Expected:** Every surface is legible in **both** modes — no invisible text, no white-on-white, no broken contrast. (Re-check this on each major screen as you go.)

☐ Pass ☐ Fail — Notes:

### UAT-C3 — Chat layout toggle
1. Toggle between **docked** chat (split pane) and **floating** chat (bubble/trigger).

**Expected:** Docked shows a resizable split (drag the divider). Floating shows a launcher that opens a chat panel. Preference persists.

☐ Pass ☐ Fail — Notes:

### UAT-C4 — Keyboard shortcuts (desktop, docked)
With focus outside any text field, press:
- **C** → toggles the canvas open/closed.
- **F** → fullscreens the active side (or toggles floating chat).
- **Esc** → exits fullscreen / closes floating chat.

**Expected:** Each shortcut does what's described; typing in an input does **not** trigger them.

☐ Pass ☐ Fail — Notes:

### UAT-C5 — Notifications panel
1. Click the bell.

**Expected:** A panel opens; unread count badge (if any) is shown; opening/closing works; no errors.

☐ Pass ☐ Fail — Notes:

---

## D. MeSpace & FieldContexts

### UAT-D1 — MeSpace exists
1. Navigate to **Spaces** (`/protected/spaces`) and open your **MeSpace**.

**Expected:** Exactly **one** MeSpace exists for User A (auto-created when the account was provisioned via invite). It's labeled as personal/private. There is no option to create a second MeSpace once you have one.

☐ Pass ☐ Fail — Notes:

### UAT-D2 — Create a FieldContext
1. Inside the MeSpace, use the bottom action bar → **Add field context**.
2. Give it a title (e.g. "Career Growth").
3. Save.

**Expected:** The FieldContext appears in the space and becomes focusable/openable. Activity is logged (you can later see it in activity/notifications).

☐ Pass ☐ Fail — Notes:

### UAT-D3 — Open a FieldContext
1. Open the FieldContext you created.

**Expected:** You're now "inside" it — the bottom floating (translucent) action bar now offers **Upload** and **Add pulse** (context-aware actions). **Upload** is a dropdown: opening it reveals **Upload document** and **Import articles**. The breadcrumb reflects Space → FieldContext.

> **Note on where Upload lives.** Upload is in the **bottom floating action bar** over the canvas — *not* in the FieldContext page header. The dropdown opens **upward** because the bar is pinned to the bottom. On narrow screens the button collapses to its icon and the "Upload" text is hidden.

☐ Pass ☐ Fail — Notes:

---

## E. Pulses (Direct Creation)

> Pulse types: **GoalPulse** (aspiration, has status ACTIVE/PAUSED/COMPLETED + horizon SHORT/MID/LONG), **ResourcePulse** (a tool/knowledge/support), **StoryPulse** (narrative/reflection), **CarePulse** (wellness), **CoreValuePulse** (guiding principle).

### UAT-E1 — Create a Goal pulse
**Pre:** Inside a FieldContext (UAT-D3).
1. Action bar → **Add pulse**.
2. Choose type **Goal**.
3. Fill title, content, intensity, and Goal-specific fields (status, horizon).
4. Save.

**Expected:** Pulse appears in the FieldContext as a card. Status defaults to ACTIVE; horizon set as chosen. No raw IDs visible.

☐ Pass ☐ Fail — Notes:

### UAT-E2 — Create each remaining pulse type
Repeat UAT-E1 for **Resource**, **Story**, **Care**, and **Core Value** pulses (one each).

**Expected:** Each saves with its type-specific fields; all five appear in the FieldContext.

☐ Pass ☐ Fail — Notes:

### UAT-E3 — Edit a pulse
1. Open the Goal pulse → edit its title/content and change status (ACTIVE → PAUSED → COMPLETED).

**Expected:** Edits persist after reload. Status transitions follow the allowed set (ACTIVE⇄PAUSED→COMPLETED; ACTIVE→COMPLETED).

☐ Pass ☐ Fail — Notes:

### UAT-E4 — Required-field validation
1. Try to save a pulse with an empty title/content.

**Expected:** Validation blocks save with a clear message.

☐ Pass ☐ Fail — Notes:

### UAT-E5 — Add a person to the space (relational record)
1. From a Space view, action bar → **Add person** (a PersonPulse — someone in your relational world who isn't a platform user).
2. Provide first + last name and any details.

**Expected:** The person is added and appears in the people/persons surface. (Note: per spec, adding the **first non-owner member** to a MeSpace converts it to a WeSpace — if adding a *person record* vs. an *account member* behaves differently, note which path you took.)

☐ Pass ☐ Fail — Notes:

---

## F. AI Assistant

The assistant has three **modes**: **Standard** (direct DB answers), **Aiden** (questions assumptions), **Braider** (stays with difficulty). Mode is chosen in **Settings → Interaction Style**.

### UAT-F1 — Basic conversation
1. Open the chat (docked or floating).
2. Ask something grounded in your data, e.g. *"What goals do I have in my Career Growth field?"*

**Expected:** A relevant, coherent reply that references your real pulses. **No raw IDs** in the response. Latency of a few seconds is acceptable.

☐ Pass ☐ Fail — Notes:

### UAT-F2 — Switch modes
1. Open **Settings** (avatar menu → Settings) → **Interaction Style** → select **Aiden**, save.
2. Ask the same kind of question; observe the different framing.
3. Switch to **Braider**, ask something reflective.

**Expected:** Each mode noticeably changes tone/approach; the selected mode persists across messages.

☐ Pass ☐ Fail — Notes:

### UAT-F3 — Capture a pulse via conversation (Human-in-the-Loop)
1. In chat, describe an aspiration in natural language, e.g. *"I want to mentor two junior designers this quarter."*
2. Ask the assistant to capture it as a pulse (or it may proactively propose).

**Expected:**
- The assistant proposes an entity creation, shown as an **approval card** (pending — not auto-saved).
- You can **Approve** (and possibly **edit**) or **reject** before anything is written.
- On approve, the pulse is created in the current FieldContext and appears on the canvas.

☐ Pass ☐ Fail — Notes:

### UAT-F4 — Reject a proposal
1. Trigger another proposal, then **reject** it.

**Expected:** Nothing is written to your space; the card resolves to a rejected/cancelled state.

☐ Pass ☐ Fail — Notes:

### UAT-F5 — Conversation threads
1. Open the **threads** sidebar/list in the chat.
2. Start a new conversation; confirm previous threads are listed and can be reopened with their history intact.

**Expected:** Threads persist and rehydrate their messages.

☐ Pass ☐ Fail — Notes:

### UAT-F6 — Assistant surfaces non-member people
**Pre:** A **PersonPulse** (a person record who is not a platform user — see UAT-E5) is attached to one of your FieldContexts, alongside at least one actual member/User contact.
1. Ask the assistant something like *"Who's connected to me who isn't a member?"* or *"Show the non-members connected to me."*

**Expected:** The assistant returns the non-member PersonPulse contact(s) distinctly from member contacts — not an empty result. No raw IDs in the reply.

☐ Pass ☐ Fail — Notes:

---

## G. Canvas Views

The bottom-center action bar has a **view toggle**: **Dashboard view** (cards), **Graph view** (curated NVL graph centered on a focal entity), **Bloom exploration** (open-ended NVL graph).

### UAT-G1 — Dashboard view
1. Ensure the toggle is on **Dashboard view**.

**Expected:** Content renders as cards/lists (spaces, fields, pulses, people) — no graph canvas. This is the default surface.

☐ Pass ☐ Fail — Notes:

### UAT-G2 — Graph view
1. Switch to **Graph view**.

**Expected:** A graph renders with a focal entity at the center and related nodes/edges around it. Zoom controls (in/out/fit) appear in the action bar and work. Clicking a node opens its info drawer / focuses it. No type labels baked into node captions (type shown in tooltip/drawer instead).

☐ Pass ☐ Fail — Notes:

### UAT-G3 — Bloom exploration
1. Switch to **Bloom exploration**.

**Expected:** A more open-ended NVL graph for free-form expansion/browsing. Zoom controls work. Switching between Dashboard ↔ Graph ↔ Bloom preserves each view's state (pan/zoom/focus survive toggles).

☐ Pass ☐ Fail — Notes:

### UAT-G4 — Focal entity continuity
1. Click a pulse/person node in Graph view to make it focal.
2. Switch to Dashboard view and back.

**Expected:** The focal selection is consistent; the assistant's answers reflect the focal entity context.

☐ Pass ☐ Fail — Notes:

---

## H. WeSpace Collaboration

### UAT-H1 — Create a WeSpace (User A)
1. From the dashboard/neutral surface, action bar → **WeSpace** (Create WeSpace).
2. Name it (e.g. "Neighborhood Mutual Aid"), save.

**Expected:** WeSpace is created and appears under `/protected/spaces/we-space`. A success toast shows. Activity logged.

☐ Pass ☐ Fail — Notes:

### UAT-H2 — Add FieldContext + pulse in the WeSpace
1. Open the WeSpace → **Add field context** → add a **Goal** pulse inside it.

**Expected:** Works the same as MeSpace; content is owned by the WeSpace.

☐ Pass ☐ Fail — Notes:

### UAT-H3 — Invite User B
1. In the WeSpace, action bar → **Add person / Add member** → invite **User B's email**, assign a role (**MEMBER**).

**Expected:** An invite is created/sent (check User B's inbox for the invite email). User A sees the pending/added member.

☐ Pass ☐ Fail — Notes:

### UAT-H4 — Accept the invite (User B)
1. In a separate browser/incognito, open User B's invite email and click the link (`/auth/accept-invite`).
2. If User B does **not** yet have an account, the invite acceptance **creates it** (set name/password as prompted) — there is no separate sign-up. If User B already has an account, just log in and accept.
3. Complete acceptance.

**Expected:** User B's account is created (or matched) via the invite, and User B joins the WeSpace — now able to see its shared FieldContexts and pulses.

☐ Pass ☐ Fail — Notes:

### UAT-H5 — Member contributes
1. As **User B** (role MEMBER), open the shared FieldContext and **add a pulse**.

**Expected:** MEMBER can create pulses in shared fields. The pulse is visible to User A too.

☐ Pass ☐ Fail — Notes:

### UAT-H6 — Role permissions
1. As **User B (MEMBER)**, try to manage members (add/remove/change roles).

**Expected:** A MEMBER **cannot** manage members (only Owner/ADMIN can). The UI should hide or block this. If User B can manage members as a plain MEMBER, that's a **Major** defect.

☐ Pass ☐ Fail — Notes:

### UAT-H7 — Owner manages membership
1. As **User A (Owner)**, change User B's role (e.g. MEMBER → GUEST) and confirm a GUEST is view-only (cannot create pulses).

**Expected:** Role change takes effect; GUEST loses create ability.

☐ Pass ☐ Fail — Notes:

---

## I. Document Ingestion

### UAT-I1 — Upload a text/markdown file
**Pre:** Inside a FieldContext (MeSpace or WeSpace you can edit).
1. Bottom action bar → **Upload** → **Upload document** → choose your `.txt` or `.md` file.

**Expected:**
- Upload succeeds; a Document is anchored to the FieldContext.
- The chat **auto-switches to a new ingest thread** titled `Ingest: <filename>`.
- The assistant turn shows **what was extracted/created** ("Created N entities") — Persons and/or Pulses — **auto-executed** (no approval click needed for ingestion).
- Extracted pulses/persons appear in the FieldContext.
- **In the background, resonance discovery runs for this field** (using the newly extracted pulses). Pending resonance **suggestions** may appear shortly after — you'll review them in **§K** (open the field's Resonances section and click **Discover** to see them).

☐ Pass ☐ Fail — Notes:

### UAT-I2 — Upload a PDF
1. Repeat UAT-I1 with your `.pdf` (1–3 pages).

**Expected:** PDF is processed (routed through multimodal extraction); entities are proposed/created the same way. Larger/over-cap files (~20 pages / ~50k chars) may be limited — note behavior.

☐ Pass ☐ Fail — Notes:

### UAT-I3 — Extraction quality & dedup
1. Review the extracted Persons/Pulses against the document content.

**Expected:** Sensible extraction; people are only created when both first AND last name are confident (partial-name mentions are listed as text, not created). Re-mentions of existing roster entries update rather than duplicate.

☐ Pass ☐ Fail — Notes:

### UAT-I4 — Unsupported file
1. Try uploading an unsupported type (e.g. `.docx` or an image).

**Expected:** Rejected with a clear message (v1 supports `.txt`, `.md`, `.pdf` only).

☐ Pass ☐ Fail — Notes:

### UAT-I5 — Re-extract / delete
1. Re-extract the document (if offered) and/or delete it.

**Expected:** Re-extract creates a fresh ingest thread and refreshes results. Deleting the document removes the file; **already-extracted entities survive** (only the provenance link drops).

☐ Pass ☐ Fail — Notes:

### UAT-I6 — Durable document link
**Pre:** A document uploaded in UAT-I1/I2, with at least one extracted Resource pulse that had no location of its own.
1. Open the document's detail drawer → confirm an **"Open file"** link is present, and click it.
2. Open the extracted Resource pulse's detail drawer → confirm its **location** field shows the same link (auto-populated only when extraction found no location — it should never overwrite a location the extraction did find).
3. Copy the link, log out, and paste it into the address bar.

**Expected:** "Open file" opens/downloads the original document (redirects to a fresh, working S3 URL — the link itself doesn't expire even though the underlying signed URL does). Logged-out access redirects to `/auth/login` instead of serving the file or raw JSON. As **User B** (no access to this Space), pasting the same link is denied, not served.

☐ Pass ☐ Fail — Notes:

---

## J. Data Import

> There are **two separate import surfaces** — don't confuse them:
>
> | Surface | Where | What it imports |
> | ------- | ----- | --------------- |
> | **General import page** | `/protected/dashboard/import` | Mixed CSV/XLSX → persons / pulses (§J1–J3) |
> | **Import articles** | Inside a FieldContext → bottom action bar → **Upload** → **Import articles** | One spreadsheet row = one article pulse (§J4–J7) |

### UAT-J1 — CSV import
1. Go to the import surface (`/protected/dashboard/import`).
2. Upload your `.csv`.

**Expected:** File parses; rows map to entities (persons/pulses); a status/summary is shown; created entities appear in the app.

☐ Pass ☐ Fail — Notes:

### UAT-J2 — XLSX import
1. Repeat with your `.xlsx`.

**Expected:** Same as CSV; Excel parsing works.

☐ Pass ☐ Fail — Notes:

### UAT-J3 — Malformed file
1. Upload a broken/empty file.

**Expected:** Graceful error, no partial corruption, clear messaging.

☐ Pass ☐ Fail — Notes:

---

> **§J4–J7 — Bulk article import into a FieldContext.**
> **Pre:** Inside a FieldContext you can edit. Prepare a `.csv`/`.xlsx` where **each row is one article**, with columns **title**, **author**, **date**, **URL**, plus optional **`author_email`**, **`pulse_type`**, **`description`**. Max **300 rows** per sheet.
>
> **Importing is a background job.** Confirming does *not* import inline — the request is queued and a worker (running every minute) drains it. On environments where the scheduled worker does not run, a job can sit at **Queued** indefinitely; that is an environment gap, not a bug in this flow — note it and move on.

### UAT-J4 — Find the Import articles entry point
1. Open a FieldContext you can edit.
2. In the **bottom floating action bar**, click **Upload**.

**Expected:** The dropdown opens **upward** and contains exactly two items — **Upload document** and **Import articles**. Confirm **Import articles** is present. (There is a second entry point for the same modal: the **Pulses** section header inside the page also carries an **Import Articles** pill.)

☐ Pass ☐ Fail — Notes:

### UAT-J5 — Preview is the approval gate
1. Click **Import articles** and choose your spreadsheet.

**Expected:** The file is parsed **in the browser** and a preview appears showing the file name, the rows that will import, and the rows with problems. **Nothing has been written yet** — confirm the FieldContext's pulse count is unchanged behind the modal. Cancelling here imports nothing.

☐ Pass ☐ Fail — Notes:

### UAT-J6 — Confirm, then watch it drain
1. Confirm the import.

**Expected:** The modal moves through **Queued → Importing** (with a row-count meter) → a **per-row result summary**. Imported articles then appear as pulses in the field (`ResourcePulse` by default; `pulse_type` can select Goal/Story). The article's URL and date land on the pulse. Authors resolve to people — by `author_email` first, otherwise by name.

☐ Pass ☐ Fail — Notes:

### UAT-J7 — Closing the modal doesn't cancel; re-importing is safe
1. Start an import, then **close the modal** while it is still running. Reopen **Import articles** for the same field.
2. After it finishes, import the **same sheet again**.

**Expected:** Step 1 — closing does not cancel the job; reopening returns you to the **running** import rather than starting a new one. Step 2 — rows that already landed come back as **skipped/existing** (filling in any missing details) rather than creating duplicate pulses.

☐ Pass ☐ Fail — Notes:

---

## K. Resonance Review

> Resonances are AI-discovered connections between pulses. Discovery creates **pending suggestions**, which you **Accept** or **Decline**. Accepting a suggestion promotes it to a confirmed **resonance** that shows up in the graph. Discovery runs **automatically when you upload a document** into a field (§I), **on demand** via the **Discover** button below, and via a daily background job.

### UAT-K1 — Run discovery & see suggestions
**Pre:** A FieldContext (MeSpace or WeSpace you can edit) with several semantically related pulses — e.g. a field you uploaded a document into (§I), or one with 3+ related pulses you created.
1. Open the field. In its **Resonances** section, click **Discover**.
2. Wait for discovery to finish (AI-backed — a few seconds up to ~2 minutes). The **Resonance Suggestions** modal opens.

**Expected:**
- The modal opens on the **Pending** tab, listing suggestions — each with a source pulse, a target pulse, a short label (e.g. "Shared Vision"), a **confidence** score, and **evidence** text. **No raw IDs.**
- There are **Pending / Accepted / Declined** tabs, each with a count.
- If you uploaded a document into this field earlier, discovery may already have created suggestions before you clicked Discover; clicking it refreshes the list.

> If nothing appears after clicking **Discover** and waiting, mark **Blocked** and notify the dev team.

☐ Pass ☐ Fail ☐ Blocked — Notes:

### UAT-K2 — Accept one suggestion
1. On a pending suggestion, click **Accept** (or use **Review All Suggestions** to step through them one at a time).

**Expected:** A success toast appears; the suggestion moves to the **Accepted** tab; and the connection now shows as an established resonance (e.g. in **Graph** / **Bloom** view or pulse details). Review metadata is recorded.

☐ Pass ☐ Fail — Notes:

### UAT-K3 — Bulk accept by confidence
1. On the **Pending** tab, find the **"Accept all at or above ___ %"** control.
2. Type a percentage (e.g. **85**). The button should read **"Accept N"**, where N = the number of pending suggestions **at or above** that confidence. Change the value (e.g. 90, 100) and confirm the count updates.
3. Click **Accept N**.

**Expected:** Every pending suggestion at or above the threshold is accepted in one action (toast: e.g. "Accepted N resonances at 85%+") and leaves the Pending tab; suggestions **below** the threshold **stay** Pending. The accepted ones become established resonances (visible in the graph). When no pending suggestion meets the threshold (e.g. 100%), the button is disabled / shows **"Accept 0"**.

☐ Pass ☐ Fail — Notes:

### UAT-K4 — Decline a suggestion
1. On a remaining pending suggestion, click **Decline**.

**Expected:** It moves to the **Declined** tab and does not appear as an established connection. Discovery should not re-suggest that same pair on a later run.

☐ Pass ☐ Fail — Notes:

### UAT-K5 — Suggestions modal on mobile (390px) + light/dark
1. Resize to **390 × 844** and open the suggestions modal (via **Discover**). Check the bulk **"Accept all at or above %"** row and the per-suggestion **Accept/Decline** in **light and dark** mode.

**Expected:** No horizontal overflow; the threshold input + "Accept N" button and per-item actions are legible and tappable in both themes; the button stacks full-width on mobile.

☐ Pass ☐ Fail — Notes:

---

## L. Search

### UAT-L1 — Header search
1. Use the search input in the top header; type a term present in your pulses/people.

**Expected:** Relevant results/suggestions surface; selecting one navigates/focuses appropriately.

☐ Pass ☐ Fail — Notes:

### UAT-L2 — Search page
1. Go to `/protected/search` (placeholder: "Explore resonances, people, and pulses…").
2. Search across pulses, people, and resonances.

**Expected:** Semantic results return relevant matches even when wording differs from the query (embedding-based). No raw IDs. Empty query / no-match states are handled gracefully.

☐ Pass ☐ Fail — Notes:

---

## M. Profile & Settings

### UAT-M1 — Profile view/edit
1. Avatar menu → **Profile** (`/protected/profile`).
2. Edit fields: pronouns, location, interests, passions, careManual, favorites, etc. Save.
3. Reload.

**Expected:** Profile renders in a proper page (view + edit). Edits persist. No broken/empty render.

☐ Pass ☐ Fail — Notes:

### UAT-M2 — Settings dialog
1. Avatar menu → **Settings**.

**Expected:** A dialog with: **theme**, **animations**, **AI assistant mode (Interaction Style)**, and **resonance preferences**. Changing each takes effect and persists.

☐ Pass ☐ Fail — Notes:

---

## N. Authorization & Privacy (Cross-Account)

These are the most important checks — they protect data sovereignty.

### UAT-N1 — MeSpace isolation
1. As **User B**, attempt to reach **User A's MeSpace** content (e.g. via search, direct URL with a known field/pulse path, or graph).

**Expected:** User B **cannot** see User A's private MeSpace pulses/fields. Direct access is denied/empty. Any leak is a **Blocker**.

☐ Pass ☐ Fail — Notes:

### UAT-N2 — WeSpace membership boundary
1. Create a second WeSpace as User A that User B is **not** a member of.
2. As User B, try to access it.

**Expected:** Access denied — non-members can't view a WeSpace's content.

☐ Pass ☐ Fail — Notes:

### UAT-N3 — Delete permissions
1. As **User B (MEMBER)**, try to delete a FieldContext or a pulse **created by User A** in the shared WeSpace.

**Expected:** Per the matrix, a plain MEMBER cannot delete others' content (FieldContext delete = Owner/ADMIN; pulse delete = creator/ADMIN/owner). Denied appropriately.

☐ Pass ☐ Fail — Notes:

### UAT-N4 — Session integrity
1. Log out User A; confirm User B's session in the other browser is unaffected and still scoped to User B's data only.

**Expected:** Sessions are independent; no data bleed between accounts.

☐ Pass ☐ Fail — Notes:

### UAT-N5 — Person PII cross-Space isolation
**Pre:** User A has a Person record (their own profile, or a PersonPulse they added) with PII filled in — email, phone, location, pronouns, description, careManual, favorites, passions, traits, fieldsOfCare, interests, gender. User B shares **no** Space with User A (or with the PersonPulse's owning Space).
1. As **User B**, try to view that Person's profile/detail drawer directly (e.g. via a known id/URL, search, or a connections listing).

**Expected:** User B sees, at most, the public directory fields (name, photo) — never the PII fields above. The profile should render as a graceful "not found" rather than error, and PII should not leak through search, add-member/discovery pickers, or connection listings either. Any PII visible across a Space boundary is a **Blocker**.

☐ Pass ☐ Fail — Notes:

---

## O. Cross-Cutting Quality Checks

Run these **on every major screen** you visited above (dashboard, space, field, pulse, chat, graph, search, profile, settings).

### UAT-O1 — Mobile / responsive (390 × 844)
1. Resize the browser to **390px wide** (or use device emulation, iPhone 12).
2. Walk through: login, dashboard, open a space → field → pulse, open chat, switch views, open settings.

**Expected at 390px:**
- No horizontal scroll / overflow.
- No overlapping chrome; controls remain tappable.
- Chat is in **floating** mode on mobile; canvas takes the viewport, chat summoned via the launcher.
- Compact, intentional density — nothing clipped or off-screen.

☐ Pass ☐ Fail — Notes:

### UAT-O2 — Light/dark parity (mobile + desktop)
1. Repeat a representative pass in **dark** mode at 390px and desktop.

**Expected:** Full parity — every surface legible and intentional in both themes at both sizes. No invisible text, no broken glass/contrast.

☐ Pass ☐ Fail — Notes:

### UAT-O3 — Console & network hygiene
1. With DevTools open (F12) across the flows, watch **Console** and **Network**.

**Expected:** No uncaught errors, no failed (4xx/5xx) requests on happy paths, no `__typename`/raw IDs leaking into visible UI text.

☐ Pass ☐ Fail — Notes:

### UAT-O4 — Performance sanity
1. Note any screen that takes an unreasonably long time to load or interact, or any obvious jank.

**Expected:** Reasonable load/interaction times; AI latency excepted (a few seconds is fine).

☐ Pass ☐ Fail — Notes:

---

## 3. Defect Log

| UAT-ID | Title | Severity | Account | Viewport/Theme | Status |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |

---

## 4. Sign-off

| Section | Result (Pass / Pass-with-issues / Fail / Blocked) | Tester | Date |
| --- | --- | --- | --- |
| A. Auth | | | |
| B. Onboarding | | | |
| C. App shell | | | |
| D. MeSpace | | | |
| E. Pulses | | | |
| F. AI Assistant | | | |
| G. Canvas views | | | |
| H. WeSpace collab | | | |
| I. Document ingestion | | | |
| J. Data import | | | |
| K. Resonance review | | | |
| L. Search | | | |
| M. Profile & Settings | | | |
| N. Authorization/privacy | | | |
| O. Cross-cutting quality | | | |

**Overall recommendation:** ☐ Go ☐ Go-with-fixes ☐ No-go

**Tester:** ____________________  **Date:** ____________  **Build/commit under test:** ____________

---

### Appendix — Glossary quick reference

- **Pulse** — a captured contribution. Types: Goal, Resource, Story, Care, Core Value.
- **FieldContext** — a thematic container for related pulses, inside a Space.
- **Space** — privacy boundary. **MeSpace** = personal/private (owner only). **WeSpace** = collaborative (owner + members).
- **Roles (WeSpace)** — ADMIN (full control), MEMBER (contribute + view), GUEST (view-only); Owner has implicit full control.
- **Resonance** — AI-discovered semantic connection between pulses. Discovery creates pending **suggestions**; you **Accept** one (→ a confirmed **ResonanceLink**, shown in the graph) or **Decline** it. Discovery runs on document upload, on demand via **Discover**, and via a daily job.
- **Assistant modes** — Standard (facts), Aiden (questions the frame), Braider (stays with difficulty).
- **Views** — Dashboard (cards), Graph (curated focal graph), Bloom (open-ended graph).
</content>
</invoke>
