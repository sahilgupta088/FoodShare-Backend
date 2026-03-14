const Donation = require('../models/Donation');
const User = require('../models/User');

// @desc    Create a new donation
// @route   POST /api/donations
// @access  Private (Donors only)
const createDonation = async (req, res) => {
  try {
    const { category, foodType, quantity, bestBefore, location, image } = req.body;

    const newDonation = new Donation({
      donor: req.user.id,
      category,
      foodType,
      quantity,
      bestBefore,
      location,
      image,
    });

    const savedDonation = await newDonation.save();
    res.status(201).json(savedDonation);
  } catch (error) {
    console.error('Create Donation Error:', error.message);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: 'Validation failed. Please check your donation details.', errors: messages });
    }
    res.status(500).json({ success: false, message: 'Failed to create donation due to a server error. Please try again later.' });
  }
};

// @desc    Get all available donations
// @route   GET /api/donations
// @access  Public
const getAvailableDonations = async (req, res) => {
    try {
        const donations = await Donation.find({ status: 'available' })
            .populate('donor', 'name')
            .sort({ createdAt: -1 });
        res.json(donations);
    } catch (error) {
        console.error('Fetch Available Donations Error:', error.message);
        res.status(500).json({ success: false, message: 'Unable to retrieve available donations at this time. Please try again later.' });
    }
};

// @desc    Claim a donation (handles race conditions)
// @route   PUT /api/donations/:id/claim
// @access  Private (Receivers only)
const claimDonation = async (req, res) => {
  try {
    const donationId = req.params.id;
    // We get the user's ID from the 'protect' middleware
    const receiverId = req.user.id;
    const updatedDonation = await Donation.findOneAndUpdate(
      { _id: donationId, status: 'available' },
      { 
        status: 'claimed',
        receiver: receiverId // Assign the logged-in user as the receiver
      },
      { new: true } // This option tells Mongoose to return the document after the update
    );

    if (!updatedDonation) {
      return res.status(409).json({ success: false, message: 'This donation is no longer available — it has already been claimed by another user. Please browse other available donations.' });
    }

    // If the update was successful, send a success response.
    res.status(200).json({ success: true, message: 'Donation claimed successfully! The donor will be notified.', donation: updatedDonation });

  } catch (error) {
    console.error('Claim Donation Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to claim donation due to a server error. Please try again later.' });
  }
};

// --- NEW FUNCTION ---
// @desc    Get all donations for the logged-in donor
// @route   GET /api/donations/mydonations
// @access  Private (Donors only)
const getMyDonations = async (req, res) => {
    try {
        const donations = await Donation.find({ donor: req.user.id }).sort({ createdAt: -1 });
        res.json(donations);
    } catch (error) {
        console.error('Fetch My Donations Error:', error.message);
        res.status(500).json({ success: false, message: 'Unable to retrieve your donations at this time. Please try again later.' });
    }
};

// --- NEW FUNCTION ---
// @desc    Get all claimed donations for the logged-in receiver
// @route   GET /api/donations/myclaims
// @access  Private (Receivers only)
const getMyClaims = async (req, res) => {
    try {
        const donations = await Donation.find({ receiver: req.user.id }).sort({ createdAt: -1 });
        res.json(donations);
    } catch (error) {
        console.error('Fetch My Claims Error:', error.message);
        res.status(500).json({ success: false, message: 'Unable to retrieve your claimed donations at this time. Please try again later.' });
    }
};


module.exports = {
  createDonation,
  getAvailableDonations,
  claimDonation,
  getMyDonations,
  getMyClaims,
};
