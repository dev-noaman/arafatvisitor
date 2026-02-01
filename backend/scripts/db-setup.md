# Fix: User `postgres` was denied access on the database `vms_db`

## 1. Create the database (if it doesn't exist)

Connect to PostgreSQL as an admin (e.g. to the default `postgres` database) and create `vms_db`:

**Option A – psql (command line)**  
```bash
psql -U postgres -d postgres -c "CREATE DATABASE vms_db;"
```

**Option B – pgAdmin / GUI**  
- Connect to server → right‑click **Databases** → **Create** → **Database**  
- Name: `vms_db` → Save  

**Option C – SQL**  
Open a SQL window connected to any existing database and run:
```sql
CREATE DATABASE vms_db;
```

## 2. Check your PostgreSQL password

Your `.env` has:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vms_db"
```
So the user is `postgres` and the password is `postgres`. If your actual PostgreSQL password is different, update the URL:

```env
DATABASE_URL="postgresql://postgres:YOUR_REAL_PASSWORD@localhost:5432/vms_db"
```

## 3. Grant access (if user exists but has no rights)

If the DB exists but `postgres` still can’t access it, run as a superuser:

```sql
\c postgres   -- or connect to any DB you can access
GRANT ALL PRIVILEGES ON DATABASE vms_db TO postgres;
\c vms_db
GRANT ALL ON SCHEMA public TO postgres;
```

## 4. After fixing

From the backend folder:
```bash
npx prisma migrate deploy
npx prisma db seed
```

## 5. If you use a different Windows PostgreSQL user

Some installs use a Windows user or a different DB user. Then set:

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/vms_db"
```

Replace `YOUR_USER` and `YOUR_PASSWORD` with the credentials that work in pgAdmin or `psql`.
