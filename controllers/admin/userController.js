// userController.js

const User = require("../../models/userModel");
const sendEmail = require("../../helperFunctions/sendEmail");
const emailModel = require("../../models/emailModel");

const UserController = {
  // Get all users with pagination, filtering, and sorting
  getAllUsers: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = "createdAt",
        isPending,
        userRole,
        search,
      } = req.query;

      let filter = {};
      if (isPending !== undefined) {
        filter.isPending = isPending;
      }
      if (userRole) {
        filter.userRole = userRole;
      }
      if (search) {
        // console.log("Search Query is not empty:", search); // Add this line to check if search parameter is not empty
        filter.$or = [
          { lastName: { $regex: search, $options: "i" } },
          { firstName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      // console.log("Filter:", filter); // Add this line to check the constructed filter object

      const skip = (page - 1) * limit;
      const sortOptions = {};
      sortOptions[sortBy] = -1;

      const users = await User.find(filter)
        .populate("credit")
        .populate("wallet")
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sortOptions);
      // console.log("Ye", users);
      const totalUsersCount = await User.countDocuments(filter);
      const totalPages = Math.ceil(totalUsersCount / limit);

      res.json({
        error: false,
        data: users,
        page: page,
        limit: limit,
        totalPages: totalPages,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  },

  // Get user by ID or email
  getUserByIdOrEmail: async (req, res) => {
    const { identifier } = req.params;
    try {
      const user = await User.findOne({
        $or: [{ _id: identifier }, { email: identifier }],
      }).populate("wallet");
      if (!user) {
        return res.status(404).json({ error: true, message: "User not found" });
      }
      res.json({ error: false, data: user.pop });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  },

  // Search users by name or email
  searchUsers: async (req, res) => {
    const { query } = req.params;
    try {
      const users = await User.find({
        $or: [
          { firstName: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
        ],
      }).populate("wallet");
      res.json({ error: false, data: users });
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  },

  // Delete user by ID
  deleteUser: async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        return res.status(404).json({ error: true, message: "User not found" });
      }
      res.json({ error: false, message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  },

  // Verify user by ID
  verifyUser: async (req, res) => {
    const { userId } = req.params;
    const { makeAdmin } = req.body;
    try {
      let user = await User.findByIdAndUpdate(
        userId,
        { isPending: false },
        { new: true }
      );
      if (!user) {
        return res.status(404).json({ error: true, message: "User not found" });
      }

      const to = user.email;
      const emails = await emailModel.find();
      const bcc = emails.map((email) => email.email).join(",");

      sendEmail({
        to: to,
        subject: "Good News! Your Tru-Scapes® Account Is Now Approved",
        text: "Good News! Your Tru-Scapes® Account Is Now Approved",
        html: `
            <p><strong>Hello ${user.firstName} ${user.lastName},</strong></p>
            <p>We’re happy to let you know that your Tru-Scapes® account has been <strong>approved!</strong> You can now log in and start enjoying all the features our platform has to offer.</p>
            <p>
              <strong>Next Steps:</strong>
              <ul>
                <li>Log in: Access your account by logging in to <a href="https://shop.tru-scapes.com">https://shop.tru-scapes.com</a></li>
                <li>Explore & Enjoy: Browse our services, request quotes, place  orders, and get the most out of Tru-Scapes®!</li>
              </ul>
            </p>
            <p>If you have any questions or need assistance, reply to this email and we’ll gladly help.</p>
            <br/>
            <br/>
            <strong>Thank you,</strong>
            <br/>
            <strong>The Tru-Scapes® Team</strong>
          `,
      });

      if (makeAdmin === true) {
        user = await User.findByIdAndUpdate(
          userId,
          { userRole: "admin" },
          { new: true }
        );
      }

      res.json({ error: false, message: "User verified successfully" });
    } catch (error) {
      console.error("Error verifying user:", error);
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  },
};

module.exports = UserController;
