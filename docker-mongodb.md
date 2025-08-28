# Local MongoDB Setup (Alternative to Atlas)

## Option 1: Docker MongoDB (Recommended for Development)

```bash
# Pull and run MongoDB container
docker run -d --name mongodb-local -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:latest

# Test connection
docker exec -it mongodb-local mongosh --username admin --password password
```

Then update your `.env.local`:
```
MONGODB_URI=mongodb://admin:password@localhost:27017/gpt_clone?authSource=admin
```

## Option 2: MongoDB Community Server

1. Download [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Install with default settings
3. Start MongoDB service
4. Update `.env.local`:
```
MONGODB_URI=mongodb://localhost:27017/gpt_clone
```

## Option 3: Fix Atlas Connection

1. Check if your IP is whitelisted in Atlas Network Access
2. Verify username/password in Database Access
3. Ensure user has correct permissions
4. Try connecting with MongoDB Compass to test credentials
