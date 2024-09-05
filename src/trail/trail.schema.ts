import * as mongoose from 'mongoose';

export const TrailSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    journey: { type: mongoose.Schema.Types.ObjectId, ref: 'Journey' },
    contents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Content' }],
    order: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'trails' },
);

export interface Trail extends mongoose.Document {
  name: string;
  journey: mongoose.Schema.Types.ObjectId;
  contents: mongoose.Types.ObjectId[];
  order: number;
}
