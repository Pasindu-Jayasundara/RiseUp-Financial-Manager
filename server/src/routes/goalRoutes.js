const express = require('express');
const router = express.Router();
const { getGoalAndRoadmap, updateGoalSkills, toggleMilestoneTask } = require('../controllers/goalController');
const { protect } = require('../middleware/auth');
const { tenantScope } = require('../middleware/tenantMiddleware');

router.use(protect);
router.use(tenantScope);

router.get('/roadmap', getGoalAndRoadmap);
router.put('/goal', updateGoalSkills);
router.put('/roadmap/:roadmapId/task/:taskId', toggleMilestoneTask);

module.exports = router;
