const User = require('../models/users');
const sha256 = require("js-sha256");
const jwt = require("jwt-then");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const emailRegex = /@gmail.com|@yahoo.com|@hotmail.com|@live.com/;

  if (!emailRegex.test(email)) throw "Email is not supported from your domain.";
  if (password.length < 6) throw "Password must be atleast 6 characters long.";

  const userExists = await User.findOne({
    email,
  });

  if (userExists) throw "User with same email already exits.";

  const user = new User({
    name,
    email,
    password: sha256(password + process.env.SALT),
  });

  await user.save();

  res.json({
    message: "User [" + name + "] registered successfully!",
  });
};


exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({
    email,
    password: sha256(password + process.env.SALT),
  });

  if (!user) throw "Email and Password did not match.";

  const token = await jwt.sign({ id: user.id }, process.env.SECRET);

  res.cookie('token', token, { httpOnly: true });

  res.json({
    message: "User logged in successfully!",
    token,
  });
};

exports.logout = async (req, res) => {
  
  await res.clearCookie('token'); // Espera a que se complete el borrado de la cookie del token
  res.clearCookie('ws');
  res.redirect('/login'); // Redirecciona al usuario a la ruta de login
};
