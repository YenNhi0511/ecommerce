// Usage: node scripts/add-5star-reviews.js "<MONGODB_URI>" [--force]
// If --force is provided, this will add a 5-star review to ALL products (even those
// that already have reviews). Without --force it only adds a review for products
// that currently have zero reviews.

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

  const Users = mongoose.connection.collection('users');
  const Products = mongoose.connection.collection('products');
  const Reviews = mongoose.connection.collection('reviews');

  // Ensure system reviewer exists
  let systemUser = await Users.findOne({ email: 'system-reviewer@example.com' });
  if (!systemUser) {
    const pwd = String(Math.random()).slice(2, 12);
    const res = await Users.insertOne({ name: 'System Reviewer', email: 'system-reviewer@example.com', password: pwd, role: 'admin', createdAt: new Date(), updatedAt: new Date() });
    systemUser = await Users.findOne({ _id: res.insertedId });
    console.log('Created system reviewer user', systemUser._id.toString());
  } else {
    console.log('Using existing system reviewer', systemUser._id.toString());
  }

  const cursor = Products.find({});
  let added = 0;
  while (await cursor.hasNext()) {
    const prod = await cursor.next();
    const prodId = prod._id;

    const existingCount = await Reviews.countDocuments({ productId: prodId });
    if (existingCount > 0 && !force) continue;

    const reviewDoc = {
      productId: prodId,
      userId: systemUser._id,
      userName: 'System Reviewer',
      rating: 5,
      comment: 'Auto-generated 5-star review',
      createdAt: new Date(),
    };

    const r = await Reviews.insertOne(reviewDoc);
    // Push review id into product.reviews array and set rating to average (simple: set to 5 if forcing new single review)
    const reviewId = r.insertedId;

    // Compute new average rating using aggregation to be safe
    const agg = await Reviews.aggregate([
      { $match: { productId: prodId } },
      { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } },
    ]).toArray();
    const stats = agg[0] || { averageRating: 0, totalReviews: 0 };

    await Products.updateOne({ _id: prodId }, { $push: { reviews: reviewId }, $set: { rating: stats.averageRating || 0 } });
    added++;
    if (added % 50 === 0) console.log('Processed', added, 'products...');
  }

  console.log('Done. Reviews added for', added, 'products.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
