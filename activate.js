const connectDB = require('../lib/db');

module.exports = async (req, res) => {
  // 设置CORS头
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
    
    const { license_key, machine_id } = req.body;
    
    if (!license_key || !machine_id) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必要参数' 
      });
    }
    
    // 简单验证 - 实际使用时应该更复杂
    const isTrialKey = license_key === 'CFA-TRIAL-7DAYS-FREE';
    const isProKey = license_key.startsWith('CFA-PRO-');
    
    if (!isTrialKey && !isProKey) {
      return res.json({ 
        success: false, 
        message: '无效的激活码' 
      });
    }
    
    // 计算过期时间
    const now = new Date();
    const expiryDate = new Date();
    
    if (isTrialKey) {
      expiryDate.setDate(now.getDate() + 7); // 7天试用
    } else {
      expiryDate.setDate(now.getDate() + 365); // 1年
    }
    
    const licenseData = {
      licenseKey: license_key,
      isActivated: true,
      activationDate: now.toISOString(),
      expiryDate: expiryDate.toISOString(),
      features: isTrialKey ? [
        'quantitative_model',
        'basic_features'
      ] : [
        'quantitative_model',
        'macro_model',
        'sentiment_model',
        'ensemble_model',
        'advanced_features',
        'coinGecko_premium',
        'unlimited_api'
      ],
      userInfo: {
        product: 'CFA_PRO_158',
        version: '1.58',
        type: isTrialKey ? 'trial' : 'professional'
      },
      offlineMode: false
    };
    
    res.json({
      success: true,
      data: licenseData
    });

  } catch (error) {
    console.error('激活错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
};