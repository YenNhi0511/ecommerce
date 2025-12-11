// Usage: node scripts/set-stock-100.js "<MONGODB_URI>" [--force]
// By default sets stock=100 for all products. With --force it will overwrite existing stock values.

const mongoose = require('mongoose');
const Product = require('../src/models/Product').default || require('../src/models/Product');

async function main() {
  const uri = process.argv[2] || process.env.MONGODB_URI;
  const force = process.argv.includes('--force');
  if (!uri) {
    console.error('Provide MongoDB URI as first arg or MONGODB_URI env var');
    process.exit(1);
  }

  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB');

  if (force) {
    const res = await Product.updateMany({}, { $set: { stock: 100 } });
    console.log('Force update complete:', res.modifiedCount, 'documents updated');
  } else {
    const res = await Product.updateMany({ $or: [ { stock: null }, { stock: { $exists: false } } ] }, { $set: { stock: 100 } });
    console.log('Conditional update complete:', res.modifiedCount, 'documents updated');
  }

  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
