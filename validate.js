const connectDB = require('../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    const { license_key } = req.body;
    
    if (!license_key) {
      return res.status(400).json({ 
        valid: false,
        message: '缺少许可证密钥' 
      });
    }
    
    // 简化验证逻辑
    const isTrialKey = license_key === 'CFA-TRIAL-7DAYS-FREE';
    const isProKey = license_key.startsWith('CFA-PRO-');
    
    if (!isTrialKey && !isProKey) {
      return res.json({
        valid: false,
        message: '无效的许可证'
      });
    }
    
    // 假设所有激活码都有效（简化版本）
    res.json({
      valid: true,
      message: '授权有效'
    });

  } catch (error) {
    console.error('验证错误:', error);
    res.status(500).json({ 
      valid: false, 
      message: '服务器内部错误' 
    });
  }
};