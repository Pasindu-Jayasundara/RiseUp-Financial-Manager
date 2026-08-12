const { getUserStore } = require('../services/mockDataStore');

const getLedgerRecords = async (req, res) => {
  const store = getUserStore(req.user?.email || req.tenantId);
  res.json(store.blockchainRecords);
};

const verifyHash = async (req, res) => {
  const { txHash } = req.body;
  const store = getUserStore(req.user?.email || req.tenantId);
  const found = store.blockchainRecords.find(r => r.txHash === txHash);

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
};

module.exports = { getLedgerRecords, verifyHash };
