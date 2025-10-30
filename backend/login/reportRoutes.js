import express from 'express';
import Report from './reportModel.js';
import User from './userModel.js';
import { authenticate } from './authMiddleware.js';

const router = express.Router();

// Helper function to determine test flag
const getTestFlag = (value, normalRange) => {
  if (!normalRange.low || !normalRange.high) return 'normal';
  if (value < normalRange.low || value > normalRange.high) return 'abnormal';
  const buffer = (normalRange.high - normalRange.low) * 0.1;
  if (value < normalRange.low + buffer || value > normalRange.high - buffer) return 'borderline';
  return 'normal';
};

// SAVE REPORT
router.post('/save', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user.saveHistory) {
      return res.status(403).json({ 
        message: 'History saving is disabled. Enable it in settings first.' 
      });
    }
    
    const { filename, language, analysis } = req.body;
    
    // Process test results
    const tests = analysis.visualization_data.map(test => ({
      name: test.test,
      value: test.value,
      unit: test.unit,
      normalRange: {
        low: test.normalRange.low,
        high: test.normalRange.high
      },
      flag: getTestFlag(test.value, test.normalRange)
    }));
    
    const report = new Report({
      userId: req.userId,
      filename,
      language,
      analysis,
      tests,
      summary: analysis.summary,
      testCount: tests.length,
      abnormalCount: tests.filter(test => test.flag === 'abnormal').length
    });
    
    await report.save();
    
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET ALL REPORTS (HISTORY)
router.get('/history', authenticate, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.userId })
      .sort({ uploadDate: -1 })
      .select('filename language uploadDate analysis.summary analysis.visualization_data');
    
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET SINGLE REPORT DETAILS
router.get('/:reportId', authenticate, async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.reportId,
      userId: req.userId
    });
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET TIMELINE FOR A SPECIFIC TEST
router.get('/timeline/:testName', authenticate, async (req, res) => {
  try {
    const testName = decodeURIComponent(req.params.testName);
    
    const reports = await Report.find({
      userId: req.userId,
      'tests.name': testName
    })
    .sort('uploadDate')
    .select('uploadDate tests');
    
    const timeline = reports.map(report => {
      const test = report.tests.find(t => t.name === testName);
      return {
        date: report.uploadDate,
        value: test?.value || null,
        unit: test?.unit || '',
        flag: test?.flag || 'normal',
        normalLow: test?.normalRange?.low || null,
        normalHigh: test?.normalRange?.high || null
      };
    });
    
    res.json({ success: true, data: timeline });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE SINGLE REPORT
router.delete('/:reportId', authenticate, async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({
      _id: req.params.reportId,
      userId: req.userId
    });
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.json({ success: true, message: 'Report deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
