// Mongosh script to fix orders so totalAmount includes shippingFee
// Run with: mongosh "<CONNECTION_URI>" scripts/fix-orders-shipping.js

(async () => {
  try {
    const coll = db.getCollection('orders');
    const cursor = coll.find({});
    let count = 0;
    while (await cursor.hasNext()) {
      const order = await cursor.next();
      if (!order) continue;

      // compute itemsTotal from items if missing
      let itemsTotal = 0;
      if (typeof order.itemsTotal === 'number') {
        itemsTotal = order.itemsTotal;
      } else if (Array.isArray(order.items)) {
        itemsTotal = order.items.reduce((s, it) => s + ((it.price || 0) * (it.quantity || 0)), 0);
      }

      // shipping disabled: always zero
      const shippingFee = 0;
      const expectedTotal = Math.max(0, itemsTotal);

      const needsUpdate = (
        order.shippingFee !== shippingFee ||
        order.itemsTotal !== itemsTotal ||
        order.totalAmount !== expectedTotal
      );

      if (needsUpdate) {
        await coll.updateOne({ _id: order._id }, { $set: { itemsTotal: itemsTotal, shippingFee: shippingFee, totalAmount: expectedTotal } });
        print(`Updated order ${order._id}: itemsTotal=${itemsTotal}, shippingFee=${shippingFee}, totalAmount=${expectedTotal}`);
        count++;
      }
    }
    print(`Done. Orders updated: ${count}`);
  } catch (e) {
    print('Script error:', e);
    throw e;
  }
})();
