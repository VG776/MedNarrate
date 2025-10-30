import mongoose from 'mongoose';

const testResultSchema = new mongoose.Schema({
  name: String,
  value: Number,
  unit: String,
  normalRange: {
    low: Number,
    high: Number
  },
  flag: {
    type: String,
    enum: ['normal', 'borderline', 'abnormal']
  }
});

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: String,
  uploadDate: {
    type: Date,
    default: Date.now
  },
  language: {
    type: String,
    default: 'en'
  },
  analysis: {
    summary: String,
    recommendations: [String],
    visualization_data: [{
      test: String,
      value: Number,
      unit: String,
      emoji: String,
      normalRange: {
        low: Number,
        high: Number
      },
      flag: String
    }]
  },
  tests: [testResultSchema],
  summary: String,
  testCount: Number,
  abnormalCount: Number
});

export default mongoose.model('Report', reportSchema);
