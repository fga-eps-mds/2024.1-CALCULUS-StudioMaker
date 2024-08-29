import * as mongoose from 'mongoose';

export const PointSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    journey: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Journey' }],
  },
  { timestamps: true, collection: 'startpoints' },
);

export interface Point extends mongoose.Document {
  name: string;
  description: string;
  user: mongoose.Schema.Types.ObjectId;
  journey: mongoose.Types.ObjectId[];
}
