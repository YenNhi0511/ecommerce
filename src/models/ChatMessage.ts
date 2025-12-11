import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema({
  userId: { type: String },
  senderName: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default (mongoose.models.ChatMessage as mongoose.Model<any>) || mongoose.model('ChatMessage', ChatMessageSchema);
