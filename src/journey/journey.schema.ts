import * as mongoose from 'mongoose';

export const JourneySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    point: { type: mongoose.Schema.Types.ObjectId, ref: 'Point' },
    trails: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trail' }],
  },
  { timestamps: true, collection: 'journeys' },
);

export interface Journey extends mongoose.Document {
  title: string;
  point: mongoose.Schema.Types.ObjectId;
  trails?: mongoose.Types.ObjectId[];
}
