const User = require("../models/userModel");

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wallet");

    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    //Perhaps the user Object is frozen, so we need to clone it and the send only wallet balance to frontend
    let clonedUser = { ...user };
    clonedUser = { ...clonedUser._doc };
    clonedUser.walletBalance = user.wallet.balance;
    delete clonedUser.wallet;

    console.log("\n", clonedUser);

    res.json({ error: false, data: clonedUser });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }

  /* try {
    const user = await User.findById(req.user._id);
    res.json({ error: false, data: user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  } */
};

// Edit user profile
const editProfile = async (req, res) => {
  try {
    // Extract allowed fields from req.body
    const { firstName, lastName, country, city, company, companyWebsite } =
      req.body;

    // Create an object with allowed fields
    const updates = {
      firstName,
      lastName,
      country,
      city,
      company,
      companyWebsite,
    };

    // Find and update user profile
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    });

    res.json({
      error: false,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

module.exports = { getProfile, editProfile };
