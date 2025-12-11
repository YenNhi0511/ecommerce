import mongoose from 'mongoose';

const WebhookEventSchema = new mongoose.Schema({
  provider: { type: String, required: true },
  eventId: { type: String, required: true },
  type: { type: String, required: true },
  raw: { type: String },
  receivedAt: { type: Date, default: Date.now },
  processed: { type: Boolean, default: false },
  processedAt: { type: Date },
  error: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed }
});

export default mongoose.models.WebhookEvent || mongoose.model('WebhookEvent', WebhookEventSchema);
