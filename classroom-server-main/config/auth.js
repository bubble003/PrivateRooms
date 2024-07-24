const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  console.log(user._id)
  return jwt.sign(
    { id: user._id},
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
