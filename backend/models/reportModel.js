import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  analysis: {
    type: Object,
    required: true
  },
  language: {
    type: String,
    default: 'English'
  },
  visualizationData: [{
    test: String,
    value_numeric: Number,
    unit: String,
    normal_low: Number,
    normal_high: Number,
    flag: String,
    color: String,
    emoji: String
  }]
});

// Add text index for search functionality
reportSchema.index({ 'analysis.summary': 'text', fileName: 'text' });

export default mongoose.model('Report', reportSchema);