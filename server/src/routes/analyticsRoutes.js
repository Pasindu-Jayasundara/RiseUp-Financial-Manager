const express = require('express');
const router = express.Router();
const { getAnalyticsAndForecast, getAIAnalysisReport } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { tenantScope } = require('../middleware/tenantMiddleware');

router.use(protect);
router.use(tenantScope);

router.get('/forecast', getAnalyticsAndForecast);
router.get('/ai-advisory', getAIAnalysisReport);

module.exports = router;
