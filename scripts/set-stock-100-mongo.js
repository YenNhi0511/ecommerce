// Usage: node scripts/set-stock-100-mongo.js "<MONGODB_URI>" [--force]
// This script updates the `products` collection directly via mongoose (no project imports required).

const mongoose = require('mongoose');

async function main() {
  const uri = process.argv[2] || process.env.MONGODB_URI;
  const force = process.argv.includes('--force');
  if (!uri) {
    console.error('Provide MongoDB URI as first arg or MONGODB_URI env var');
    process.exit(1);
  }

  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB');

  const coll = mongoose.connection.collection('products');
  if (force) {
    const res = await coll.updateMany({}, { $set: { stock: 100 } });
    console.log('Force update complete:', res.modifiedCount, 'documents updated');
  } else {
    const res = await coll.updateMany({ $or: [ { stock: { $exists: false } }, { stock: null } ] }, { $set: { stock: 100 } });
    console.log('Conditional update complete:', res.modifiedCount, 'documents updated');
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
