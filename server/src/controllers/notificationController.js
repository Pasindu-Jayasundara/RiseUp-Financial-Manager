const { getUserStore } = require('../services/mockDataStore');

const getNotifications = async (req, res) => {
  const store = getUserStore(req.user?.email || req.tenantId);
  res.json(store.notifications);
};

module.exports = { getNotifications };
