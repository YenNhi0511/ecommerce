// Usage: node scripts/backfill-sold.js "<MONGODB_URI>"
// This script aggregates sold counts from orders with status 'processing' or 'completed' and writes to Product.sold

const mongoose = require('mongoose');
const Order = require('../src/models/Order').default || require('../src/models/Order');
const Product = require('../src/models/Product').default || require('../src/models/Product');

async function main() {
  const uri = process.argv[2] || process.env.MONGODB_URI;
  if (!uri) {
    console.error('Provide MongoDB URI as first arg or MONGODB_URI env var');
    process.exit(1);
  }

  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected');

  // Aggregate sold counts from orders that are processing/paid/completed
  const pipeline = [
    { $match: { orderStatus: { $in: ['processing', 'shipped', 'delivered'] } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' } } }
  ];

  const results = await Order.aggregate(pipeline);
  console.log('Aggregated sold counts for', results.length, 'products');

  for (const r of results) {
    try {
      await Product.findByIdAndUpdate(r._id, { $set: { sold: r.totalSold } });
    } catch (e) {
      console.error('Failed to update product', r._id, e.message);
    }
  }

  console.log('Backfill complete');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
