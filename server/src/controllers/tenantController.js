const { getUserStore } = require('../services/mockDataStore');

const getTenants = async (req, res) => {
  const store = getUserStore(req.user?.email || req.tenantId);
  res.json(store.tenants);
};

const createTenant = async (req, res) => {
  const { name, type } = req.body;
  const store = getUserStore(req.user?.email || req.tenantId);

  const newTenant = {
    _id: 't_' + Date.now(),
    name,
    type: type || 'personal'
  };
  store.tenants.push(newTenant);
  res.status(201).json(newTenant);
};

module.exports = { getTenants, createTenant };
