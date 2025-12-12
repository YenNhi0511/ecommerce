# 🔧 MONGODB CONNECTION TROUBLESHOOTING

## ❌ Error: ECONNREFUSED \_mongodb.\_tcp.cluster0.txz3p.mongodb.net

**Meaning:** Server không thể kết nối tới MongoDB Atlas cluster.

---

## 🚀 QUICK FIX (5 phút)

### Step 1: Chạy script chẩn đoán

```bash
.\fix-mongodb.bat
```

Script sẽ tự động:

- Test connection
- Hướng dẫn fix IP whitelist
- Verify connection sau khi fix

---

## 🔍 COMMON CAUSES & SOLUTIONS

### ✅ Solution 1: IP Whitelist (Most Common - 90% cases)

**Problem:** MongoDB Atlas chặn IP address của bạn.

**Fix:**

1. **Go to MongoDB Atlas:**

   - URL: https://cloud.mongodb.com
   - Login với account của bạn

2. **Navigate to Network Access:**

   - Select your project
   - Click "Network Access" (left sidebar)

3. **Add IP Address:**

   - Click "Add IP Address" button
   - Option 1 (For testing): Click "Allow Access from Anywhere"
     - This adds `0.0.0.0/0` to whitelist
   - Option 2 (Production): Add your specific IP
     - Get your IP: https://whatismyipaddress.com
     - Add: `YOUR_IP/32`

4. **Wait 1-2 minutes** for changes to propagate

5. **Test again:**
   ```bash
   node test-mongodb.js
   ```

**Expected Result:**

```
✅ MongoDB Connected Successfully!
📊 Database: TMDT
🌐 Host: cluster0-shard-00-00.txz3p.mongodb.net
```

---

### ✅ Solution 2: Cluster Paused/Inactive

**Problem:** MongoDB Atlas free tier tự động pause cluster sau thời gian không sử dụng.

**Fix:**

1. Go to: https://cloud.mongodb.com
2. Click "Database" (left sidebar)
3. Find your cluster: `cluster0`
4. If you see "Paused" status:
   - Click "Resume" button
   - Wait 2-3 minutes for cluster to start
5. Test again: `node test-mongodb.js`

---

### ✅ Solution 3: Wrong Username/Password

**Problem:** MongoDB URI có username/password sai.

**Current URI in .env:**

```
MONGODB_URI=mongodb+srv://yennhi0511:yennhi0511@cluster0.txz3p.mongodb.net/TMDT?retryWrites=true&w=majority
```

**Fix:**

1. **Verify Database User:**

   - Go to: Database Access (left sidebar)
   - Check user: `yennhi0511` exists
   - If not, create new user:
     - Click "Add New Database User"
     - Username: `yennhi0511`
     - Password: `yennhi0511`
     - Built-in Role: Atlas Admin
     - Click "Add User"

2. **Reset Password (if exists):**

   - Find user in list
   - Click "Edit"
   - Click "Edit Password"
   - Set new password
   - Update .env with new password

3. **Special Characters:** If password có ký tự đặc biệt, phải URL encode:
   - `@` → `%40`
   - `#` → `%23`
   - `$` → `%24`
   - `%` → `%25`

---

### ✅ Solution 4: Wrong Database Name

**Problem:** Database name không tồn tại.

**Current Database:** `TMDT`

**Fix:**

1. Go to: Database → Browse Collections
2. Check if `TMDT` database exists
3. If not, create it:

   - Click "Add My Own Data"
   - Database name: `TMDT`
   - Collection name: `users`
   - Click "Create"

4. Update .env if needed:
   ```env
   MONGODB_URI=mongodb+srv://yennhi0511:yennhi0511@cluster0.txz3p.mongodb.net/TMDT?retryWrites=true&w=majority
   #                                                                          ^^^^
   #                                                                       Database name
   ```

---

### ✅ Solution 5: Network/Firewall Issues

**Problem:** Corporate firewall, VPN, hoặc antivirus chặn MongoDB connection.

**Fix:**

1. **Disable VPN** (if using)
2. **Disable Antivirus temporarily** (Kaspersky, Avast, etc.)
3. **Check Windows Firewall:**
   - Windows Security → Firewall & network protection
   - Allow Node.js through firewall
4. **Try mobile hotspot** (để test nếu WiFi có vấn đề)

---

### ✅ Solution 6: DNS Issues

**Problem:** DNS không resolve được MongoDB hostname.

**Fix:**

1. **Flush DNS cache:**

   ```bash
   ipconfig /flushdns
   ```

2. **Change DNS servers:**

   - Open Network Settings
   - Change DNS to Google DNS:
     - Primary: 8.8.8.8
     - Secondary: 8.8.4.4

3. **Test DNS:**
   ```bash
   nslookup cluster0.txz3p.mongodb.net
   ```

---

## 🧪 MANUAL TESTING

### Test 1: Basic Connection

```bash
node test-mongodb.js
```

**Expected Output:**

```
🔍 Testing MongoDB Connection...
URI: mongodb+srv://yennhi0511:****@cluster0.txz3p.mongodb.net/TMDT

⏳ Connecting to MongoDB Atlas...
✅ MongoDB Connected Successfully!
📊 Database: TMDT
🌐 Host: cluster0-shard-00-00.txz3p.mongodb.net

📁 Collections: users, products, orders, carts, userbehaviors

✅ Test completed successfully!
```

---

### Test 2: Connection String Validation

**Valid formats:**

✅ Correct:

```
mongodb+srv://username:password@cluster0.txz3p.mongodb.net/TMDT?retryWrites=true&w=majority
```

❌ Wrong:

```
mongodb://username:password@cluster0.txz3p.mongodb.net/TMDT  # Missing +srv
mongodb+srv://@cluster0.txz3p.mongodb.net/TMDT  # Missing credentials
mongodb+srv://username:password@cluster0/TMDT  # Missing full hostname
```

---

### Test 3: API Endpoint Test

**After fixing MongoDB, test APIs:**

1. Start server:

   ```bash
   npm run dev:admin
   ```

2. Test analytics API:

   ```bash
   curl http://localhost:3001/api/analytics/overview
   ```

3. Should return 200 OK (not 500)

---

## 📊 VERIFICATION CHECKLIST

After applying fixes, verify:

- [ ] `node test-mongodb.js` returns ✅ success
- [ ] Server starts without MongoDB errors
- [ ] `/api/analytics/track` returns 200 (not 500)
- [ ] No more "ECONNREFUSED" errors in console
- [ ] Admin dashboard loads stats correctly
- [ ] Analytics page shows charts

---

## 🔄 IF STILL NOT WORKING

### Last Resort Solutions:

**1. Create New Cluster:**

- Go to: Database → Create New Cluster
- Choose free tier (M0)
- Region: Choose closest to you
- Create
- Update .env with new connection string

**2. Use Local MongoDB:**

```bash
# Install MongoDB locally
# Windows: https://www.mongodb.com/try/download/community

# Start MongoDB
mongod --dbpath="D:\mongodb\data"

# Update .env
MONGODB_URI=mongodb://localhost:27017/TMDT
```

**3. Use Alternative (Temporary):**

- MongoDB Compass (GUI tool)
- Mock data trong code
- SQLite local database

---

## 📞 GET HELP

**MongoDB Atlas Support:**

- https://www.mongodb.com/docs/atlas/
- https://www.mongodb.com/community/forums/

**Check Status:**

- https://status.mongodb.com/

**Your Cluster Info:**

- Organization ID: `675b8f1c43e06e4aa8b7f6ba`
- Cluster: `cluster0.txz3p.mongodb.net`
- Database: `TMDT`
- Region: MongoDB Atlas (Cloud)

---

## 📝 PREVENTION

**To avoid this in future:**

1. **IP Whitelist Maintenance:**

   - Add `0.0.0.0/0` for development
   - Add specific IPs for production

2. **Keep Cluster Active:**

   - Free tier pauses after 60 days inactivity
   - Access database weekly to keep active

3. **Backup Connection:**

   - Keep spare cluster
   - Export data regularly

4. **Monitor Connection:**
   - Add retry logic in code
   - Log connection errors
   - Alert on failures

---

**Last Updated:** December 13, 2025  
**Status:** IP Whitelist is most common fix (90% success rate)
