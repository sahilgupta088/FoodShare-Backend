const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists. Please use a different email or try logging in.' });
    }

    user = new User({ name, email, password, role });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = { user: { id: user.id, role: user.role } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5d' },
      (err, token) => {
        if (err) throw err;
        // --- MODIFICATION: Send name and role along with the token ---
        res.status(201).json({ token, name: user.name, role: user.role });
      }
    );
  } catch (err) {
    console.error('Registration Error:', err.message);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: 'Validation failed. Please check your input.', errors: messages });
    }
    res.status(500).json({ success: false, message: 'Registration failed due to a server error. Please try again later.' });
  }
};


// @desc    Authenticate user & get token (Login)
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password. Please check your credentials and try again.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password. Please check your credentials and try again.' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5d' },
            (err, token) => {
                if (err) throw err;
                // --- MODIFICATION: Send name and role along with the token ---
                res.json({ token, name: user.name, role: user.role });
            }
        );
    } catch (err) {
        console.error('Login Error:', err.message);
        res.status(500).json({ success: false, message: 'Login failed due to a server error. Please try again later.' });
    }
};


module.exports = {
  registerUser,
  loginUser,
};
