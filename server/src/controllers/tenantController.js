const Tenant = require('../models/Tenant');

const getTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find({ $or: [{ owner: req.user._id }, { members: req.user._id }] });
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTenant = async (req, res) => {
  try {
    const { name, type } = req.body;
    const newTenant = await Tenant.create({
      name,
      type: type || 'personal',
      owner: req.user._id,
      members: [req.user._id]
    });
    res.status(201).json(newTenant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTenants, createTenant };
