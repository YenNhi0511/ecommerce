// Usage: node scripts/create-admin-seller.js "<MONGODB_URI>"
// Creates two users: admin and seller with password '12345678'

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function main() {
  const uri = process.argv[2] || process.env.MONGODB_URI;
  if (!uri) {
    console.error('Provide MongoDB URI as first arg or MONGODB_URI env var');
    process.exit(1);
  }

  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB');

  const Users = mongoose.connection.collection('users');

  const passwordPlain = '12345678';
  const hashed = await bcrypt.hash(passwordPlain, 10);

  const accounts = [
    { name: 'Admin User', email: 'admin@example.com', role: 'admin' },
    { name: 'Seller User', email: 'seller@example.com', role: 'seller' },
  ];

  for (const acc of accounts) {
    const existing = await Users.findOne({ email: acc.email });
    if (existing) {
      console.log('User already exists:', acc.email);
      // Optionally update password and role
      await Users.updateOne({ _id: existing._id }, { $set: { password: hashed, role: acc.role, updatedAt: new Date() } });
      console.log('Updated password+role for', acc.email);
    } else {
      const doc = { name: acc.name, email: acc.email, password: hashed, role: acc.role, createdAt: new Date(), updatedAt: new Date() };
      const res = await Users.insertOne(doc);
      console.log('Created user', acc.email, 'id=', res.insertedId.toString());
    }
  }

  console.log('All done. Password for both accounts is:', passwordPlain);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
