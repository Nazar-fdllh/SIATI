const { db } = require('../config/database');

/**
 * Get all system configurations
 */
async function getConfig() {
  const configs = await db('system_config').select('*');
  const result = {};
  
  configs.forEach(c => {
    // Attempt to parse JSON arrays (e.g. allowed_ip_ranges)
    try {
      if (c.value && (c.value.startsWith('[') || c.value.startsWith('{'))) {
        result[c.key] = JSON.parse(c.value);
      } else {
        result[c.key] = c.value;
      }
    } catch (e) {
      result[c.key] = c.value;
    }
  });

  return result;
}

/**
 * Update system configurations
 */
async function updateConfig(data) {
  const keys = Object.keys(data);
  const trx = await db.transaction();

  try {
    for (const key of keys) {
      let value = data[key];
      // Convert arrays/objects to JSON strings
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      } else {
        value = String(value);
      }

      const exists = await trx('system_config').where('key', key).first();
      if (exists) {
        await trx('system_config').where('key', key).update({ value, updated_at: new Date() });
      } else {
        await trx('system_config').insert({ key, value });
      }
    }
    
    await trx.commit();
    return { success: true };
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

module.exports = {
  getConfig,
  updateConfig
};
