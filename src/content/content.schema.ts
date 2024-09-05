import * as mongoose from 'mongoose';

export const ContentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    trail: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trail',
      required: true,
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'contents' },
);

export interface Content extends mongoose.Document {
  title: string;
  content: string;
  trail: mongoose.Schema.Types.ObjectId;
}
