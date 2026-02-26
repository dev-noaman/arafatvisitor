Got it. Let me refine the full plan based on what you need.

---

## Ticket System — Refined Blueprint

### Ticket Types

There are two distinct types, each with its own flow:

**Suggestion**
- Simple: subject + description
- No urgency, no resolution needed
- Admin can acknowledge it, mark it as "Reviewed", optionally reply with a comment
- Think of it as a feedback box

**Complaint**
- Structured: subject, description, category, priority, attachments
- Requires a resolution — admin cannot close it without writing a resolution text
- Has a full lifecycle: Open → In Progress → Resolved → Closed (or Rejected)
- The person who raised it can see the resolution and reopen if unsatisfied

---

### Flow: Any User Raises a Ticket

Every role (ADMIN, RECEPTION, HOST, STAFF) can create tickets. The flow:

1. User clicks "Tickets" in sidebar
2. Sees their own tickets listed (filtered by "My Tickets" by default)
3. Clicks "New Ticket"
4. First choice: **Suggestion** or **Complaint** (two cards/buttons to pick)

**If Suggestion:**
- Subject (required)
- Description (required, textarea)
- Submit → status becomes SUBMITTED
- Done. User sees it in their list with status badge

**If Complaint:**
- Subject (required)
- Description (required, textarea — explain the issue in detail)
- Category dropdown: IT Issue, Facility Issue, Visitor System Bug, Service Quality, Other
- Priority: Low, Medium, High, Urgent
- Attachments: upload up to 3 files (images, PDFs) — evidence of the issue
- Optional: link to a specific visit or delivery (searchable dropdown, so they can say "this complaint is about visit VMS-001234")
- Submit → status becomes OPEN
- Done. User sees it in their list

After submitting, the user can:
- View their ticket and see status updates
- See admin comments/replies on their ticket
- Add follow-up comments to their own ticket
- Reopen a resolved complaint if they disagree with the resolution

---

### Flow: Admin Handles Tickets

Admin sees ALL tickets from all users. The admin view has two tabs or filter modes: **Suggestions** and **Complaints** (since they need different handling).

**Handling a Suggestion:**
1. Admin sees suggestion in list
2. Opens it, reads it
3. Can add a comment (e.g. "Great idea, we'll consider this" or "Already planned for next quarter")
4. Marks status: REVIEWED or DISMISSED
5. That's it — lightweight

**Handling a Complaint:**
1. Admin sees complaint in list, prioritized by urgency
2. Opens it, reads description, views attachments
3. Assigns it to themselves (or another admin user) — status moves to IN_PROGRESS
4. Adds internal comments along the way (visible only to admins, for internal discussion)
5. Adds replies visible to the ticket creator (so they know it's being worked on)
6. When done, admin writes a **Resolution** (required text field — cannot skip this) and sets status to RESOLVED
7. The creator gets notified and can see the resolution
8. If creator is satisfied → ticket auto-closes after X days, or admin manually closes
9. If creator disagrees → they can reopen with a comment explaining why

**Complaint statuses:**
OPEN → IN_PROGRESS → RESOLVED → CLOSED
↑___________________________|  (reopen)

Also: REJECTED (admin can reject with a reason, e.g. duplicate or invalid)

---

### Database Design (Updated)

**Ticket**
- id (auto-increment)
- ticketNumber (auto-generated: SGT-0001 for suggestions, CMP-0001 for complaints)
- type: SUGGESTION or COMPLAINT
- subject
- description
- status: SUBMITTED/REVIEWED/DISMISSED (suggestions) or OPEN/IN_PROGRESS/RESOLVED/CLOSED/REJECTED (complaints)
- priority: null for suggestions, LOW/MEDIUM/HIGH/URGENT for complaints
- category: null for suggestions, string for complaints
- resolution: null until admin resolves (required to move to RESOLVED — complaints only)
- rejectionReason: null unless rejected
- createdById → User
- assignedToId → User (nullable, complaints only)
- relatedVisitId → Visit (nullable, optional)
- relatedDeliveryId → Delivery (nullable, optional)
- createdAt, updatedAt, resolvedAt, closedAt

**TicketComment**
- id
- ticketId → Ticket
- userId → User
- message
- isInternal (boolean — true means only admins see it, false means everyone on the ticket sees it)
- createdAt

**TicketAttachment**
- id
- ticketId → Ticket
- fileName
- filePath (stored on server filesystem, like `/uploads/tickets/`)
- fileSize
- mimeType
- uploadedById → User
- createdAt

---

### API Endpoints

| Method | Path | Who | Purpose |
|--------|------|-----|---------|
| POST | `/tickets` | ALL | Create suggestion or complaint |
| GET | `/tickets` | ALL (scoped) | List — ADMIN sees all, others see own |
| GET | `/tickets/:id` | ALL (scoped) | Detail with comments + attachments |
| PATCH | `/tickets/:id` | ADMIN | Update status, priority, assignee, resolution |
| POST | `/tickets/:id/comments` | ALL (scoped) | Add comment (admin can set isInternal) |
| POST | `/tickets/:id/attachments` | ALL (scoped) | Upload file attachment |
| GET | `/tickets/:id/attachments/:attachId` | ALL (scoped) | Download attachment |
| POST | `/tickets/:id/reopen` | Creator only | Reopen a resolved complaint |
| GET | `/tickets/stats` | ADMIN | Dashboard stats |

---

### Admin Dashboard Pages

**1. Tickets List Page**

Two tabs at top: **Suggestions** | **Complaints**

Suggestions tab — simple table:
- Ticket #, Subject, Created By, Role, Date, Status (Submitted/Reviewed/Dismissed)
- Click to open detail

Complaints tab — full table:
- Ticket #, Subject, Category, Priority, Created By, Assigned To, Status, Date
- Filters: status, priority, category, assignee, date range
- Sort by priority (urgent first) by default
- Search by subject or ticket number

**2. Ticket Detail Page**

Header section:
- Ticket number + type badge (Suggestion / Complaint)
- Status badge, priority badge (complaints only)
- Created by: name + role badge + date
- Assigned to: name (complaints, editable by admin)
- Category (complaints only)
- Related visit/delivery link if any

Body section:
- Description text
- Attachments grid (clickable thumbnails/file icons for complaints)

Resolution section (complaints only, visible when resolved):
- Resolution text written by admin
- Resolved by + date
- "Reopen" button visible to creator if status is RESOLVED

Comments/timeline section:
- Chronological list of all comments
- Each shows: user avatar placeholder, name, role badge, timestamp, message
- Internal comments (isInternal=true) highlighted differently, only visible to admins
- Comment input at bottom with send button
- Admin sees a toggle: "Internal note" vs "Reply to user"

Admin action bar (bottom or sidebar):
- Status dropdown (change status)
- Assign dropdown (pick admin user)
- Priority dropdown (complaints)
- Resolution textarea (appears when setting status to Resolved — required, cannot submit empty)
- Reject button with reason input

**3. New Ticket Page/Modal**

Step 1: Pick type — two cards:
- 💡 **Suggestion** — "Share an idea or feedback"
- ⚠️ **Complaint** — "Report an issue that needs resolution"

Step 2: Form (changes based on type picked):

Suggestion form:
- Subject
- Description
- Submit

Complaint form:
- Subject
- Description
- Category dropdown
- Priority dropdown
- Attachments (drag-drop or file picker, up to 3 files, max 5MB each)
- Link to visit/delivery (optional searchable dropdown)
- Submit

---

### Notifications

| Event | Who gets notified | Channel |
|-------|------------------|---------|
| New complaint created | All ADMIN users | Email + in-app |
| New suggestion created | All ADMIN users | Email (optional) |
| Ticket assigned to admin | That admin | Email |
| Status changed | Ticket creator | Email + WhatsApp |
| New reply (non-internal comment) | Ticket creator | Email |
| Resolution written | Ticket creator | Email + WhatsApp |
| Ticket reopened | Assigned admin | Email |

Uses your existing notification module — no new infrastructure needed.

---

### Sidebar & Access

| Role | Sees in sidebar | What they see inside |
|------|----------------|---------------------|
| ADMIN | "Tickets" with open count badge | All tickets, both tabs, full management |
| RECEPTION | "Tickets" with own count | Own tickets only, can create + comment |
| HOST | "Tickets" with own count | Own tickets only, can create + comment |
| STAFF | "Tickets" with own count | Own tickets only, can create + comment |

---

### Build Order

| Step | What | Effort |
|------|------|--------|
| 1 | Prisma schema (3 models) + migration | Small |
| 2 | File upload utility for attachments | Small |
| 3 | DTOs + validation | Small |
| 4 | TicketsService (CRUD + scoping + resolution logic) | Medium |
| 5 | TicketsController + guards | Medium |
| 6 | Admin API service (`tickets.ts`) | Small |
| 7 | Tickets list page with tabs | Medium |
| 8 | New ticket form (type picker + dynamic form) | Medium |
| 9 | Ticket detail page (comments, attachments, resolution, admin actions) | Large |
| 10 | Sidebar item + routing | Small |
| 11 | Dashboard stats widget | Small |
| 12 | Notification triggers | Medium |
| 13 | Mobile app ticket screen (Phase 2) | Medium |

---

This is the complete blueprint. Want me to start building it?