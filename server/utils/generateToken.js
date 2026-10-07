const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'finsight_dev_secret_key_jwt_2026_secured', {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
