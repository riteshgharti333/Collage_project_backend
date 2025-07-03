import mongoose from 'mongoose';

const aboutSchema = new mongoose.Schema(
  {
    content: {
      type: [String], 
      required: true,
      validate: [(val) => val.length > 0, 'At least one paragraph is required'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'about',
  }
);

export default mongoose.model('About', aboutSchema);
