# Quickstart: Host-User Auto-Sync

**Branch**: `002-host-user-sync` | **Date**: 2026-01-29

## What This Feature Does

When admins bulk-import Hosts via CSV, the system automatically:
1. Creates a User account for each new Host
2. Sets the User role to HOST
3. Links the User to the Host via hostId
4. Generates a random secure password (host uses "forgot password" to set their own)

Additionally, the Users list in AdminJS now has a role filter dropdown that defaults to showing only ADMIN and RECEPTION users.

## Testing the Feature

### 1. Start the Backend

```bash
cd backend
npm run start:dev
```

### 2. Open AdminJS Dashboard

Navigate to `http://localhost:3000/admin` and log in as Admin.

### 3. Test Bulk Import with Auto User Creation

1. Go to **Hosts** → Click **Bulk Import**
2. Upload a CSV file with new hosts:

```csv
ID,Name,Company,Email Address,Phone Number,Location,Status
H001,John Doe,Acme Corp,john@acme.com,97412345678,Arafat - Barwa Towers,active
H002,Jane Smith,Tech Inc,,97487654321,Arafat - Marina 50 Tower,active
```

3. Click **Import**
4. Verify the results show:
   - Hosts inserted: 2
   - **Users created: 2** (new field)
   - Users skipped: 0

### 4. Verify User Accounts Created

1. Go to **Users** in the sidebar
2. Set the role filter to **HOST** (or clear filter to see all)
3. Verify you see:
   - John Doe (john@acme.com, role: HOST)
   - Jane Smith (host_2@system.local, role: HOST)

### 5. Test Duplicate Prevention

1. Re-upload the same CSV file
2. Verify the results show:
   - Hosts skipped: 2 (already exist)
   - Users created: 0
   - Users skipped: 2

### 6. Test Users Role Filter

1. Go to **Users**
2. The list should show only ADMIN and RECEPTION users by default
3. Click the filter icon → Select **HOST** from the role dropdown
4. The list should now include HOST users

## Expected API Response

```json
{
  "totalProcessed": 2,
  "inserted": 2,
  "skipped": 0,
  "rejected": 0,
  "rejectedRows": [],
  "usersCreated": 2,
  "usersSkipped": 0
}
```

## Password Reset Flow for Host Users

Since auto-created users have random passwords:

1. Host opens `http://localhost:3000/admin/login`
2. Clicks "Forgot your password?"
3. Enters their email (john@acme.com or host_X@system.local)
4. Receives password reset email
5. Sets their own password
6. Can now log in with HOST role access

## Troubleshooting

### User Not Created

- Check if a User with that email already exists
- Check if a User is already linked to that Host (hostId)
- Check backend logs for any errors during import

### Email Format

- Hosts with email in CSV: User gets that email
- Hosts without email: User gets `host_{dbId}@system.local`

### Role Filter Not Working

- Ensure you're logged in as ADMIN (only admins can see Users)
- Clear browser cache and refresh
- Check for JavaScript errors in console
