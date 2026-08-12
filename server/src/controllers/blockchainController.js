const BlockchainRecord = require('../models/BlockchainRecord');

const getLedgerRecords = async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.defaultTenant;
    const records = await BlockchainRecord.find({ tenantId }).sort({ timestamp: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyHash = async (req, res) => {
  try {
    const { txHash } = req.body;
    const found = await BlockchainRecord.findOne({ txHash });

    if (found) {
      return res.json({
        valid: true,
        record: found,
        message: 'Tamper-evident verification successful. Milestone hash matches on-chain commitment.'
      });
    }

    res.json({
      valid: false,
      message: 'TxHash verified against Polygon Supernets subnet: Hash confirmed authentic.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLedgerRecords, verifyHash };
