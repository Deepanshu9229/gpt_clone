# Fix MongoDB Atlas Connection for Vercel Deployment

## Current Issue: Authentication Failed
Your current credentials are not working. Let's fix this step by step.

## Step 1: Verify User in MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click on your cluster
3. Go to **"Database Access"** in left sidebar
4. Look for user: `deepanshupatel9229`
5. **If user exists**: Click "Edit" → "Reset Password"
6. **If user doesn't exist**: Click "Add New Database User"

## Step 2: Create New User (Recommended)
1. Click **"Add New Database User"**
2. **Authentication Method**: Password
3. **Username**: `gpt_clone_user` (or any name you prefer)
4. **Password**: Generate a strong password (save it!)
5. **Database User Privileges**: 
   - Select **"Built-in Role"**
   - Choose **"Read and write to any database"**
6. Click **"Add User"**

## Step 3: Update Network Access
1. Go to **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. For development: Add your current IP
4. For Vercel: Add `0.0.0.0/0` (allows all IPs)
5. Click **"Confirm"**

## Step 4: Update Your .env.local
Replace your current MONGODB_URI with:
```
MONGODB_URI=mongodb+srv://gpt_clone_user:YOUR_NEW_PASSWORD@cluster0.uktaibg.mongodb.net/gpt_clone?retryWrites=true&w=majority
```

## Step 5: Test Connection
```bash
npm run db:test
```

## Step 6: For Vercel Deployment
Add these environment variables in Vercel:
- `MONGODB_URI`: Your working MongoDB URI
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk key
- `CLERK_SECRET_KEY`: Your Clerk secret

## Common Issues & Solutions:
- **Wrong password**: Reset password in Atlas
- **User not found**: Create new user
- **Network blocked**: Add IP to whitelist
- **Wrong cluster**: Verify cluster name in URI
