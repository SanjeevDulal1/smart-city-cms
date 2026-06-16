const Setting = require('../models/Setting');

const getSettings = async (req, res) => {
  try {
    const settings = await Setting.find({});
    const result = {};
    settings.forEach((s) => { result[s.key] = s.value; });
    res.json({ success: true, settings: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    const setting = await Setting.findOneAndUpdate(
      { key },
      { key, value },
      { upsert: true, new: true }
    );
    res.json({ success: true, setting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPublicSettings = async (req, res) => {
  try {
    const demoMode = await Setting.findOne({ key: 'demo_mode' });
    res.json({
      success:  true,
      demoMode: demoMode?.value ?? true,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSettings, updateSetting, getPublicSettings };