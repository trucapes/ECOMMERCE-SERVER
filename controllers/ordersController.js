const emailModel = require("../models/emailModel");
const ordersModel = require("../models/ordersModel");
const userModel = require("../models/userModel");
const nodemailer = require("nodemailer");

const getOrders = async (req, res) => {
  try {
    const id = req.user._id;
    if (req.user.userRole !== "admin") {
      console.log("second");
      const orders = await ordersModel
        .find({ userId: id })
        .populate("products")
        .sort({ createdAt: -1 });

      res.status(200).json({ error: false, data: orders });
    } else {
      console.log("first");
      const orders = await ordersModel
        .find({})
        .populate("userId")
        .sort({ createdAt: -1 });
      res.status(200).json({ error: false, data: orders });
    }
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    let { id, status } = req.body;
    console.log(status);
    status = status.toLowerCase();
    try {
      const admin = await userModel.findOne({ userRole: "admin" });

      const emails = await emailModel.find();

      const bcc = emails.map((email) => email.email).join(",");
      if (status === "delivered") {
        const order = await ordersModel.findByIdAndUpdate(id, {
          status: status,
          isDelivered: true,
        });
        const user = await userModel.findById(order.userId);

        const to = user.email ? user.email : admin.email;

        const Transport = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "orders@tru-scapes.com",
            pass: "fsrvuyynrofrojew",
          },
        });

        const mailOptions = {
          from: "TruScapes <no-reply@truscapes.com>",
          to,
          subject: "Your Tru-Scapes® Order " + order._id + " Is Complete",
          text: "Your Tru-Scapes® Order " + order._id + " Is Complete",
          html: `
            <p>Hello ${user.firstName},</p>
            <p>Happy day! Your order ${order._id} has been successfully delivered. <br/>
We hope everything meets (or even exceeds) your expectations. If you love what you received, consider leaving a review to help other customers make informed decisions.</p>
            
            <p>Need help or have questions? Just hit reply, and we’ll be there for you.<br/>
Thanks for choosing Tru-Scapes®!
</p>
            <p>Best regards,</p>
            <p>The TruScapes Team</p>
          `,
          bcc,
        };

        Transport.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log("Error sending email: " + error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        return res.status(200).json({ error: false, message: "Order Updated" });
      } else {
        const order = await ordersModel.findByIdAndUpdate(id, {
          status: status,
        });

        const user = await userModel.findById(order.userId);

        const to = user.email ? user.email : admin.email;

        const Transport = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "orders@tru-scapes.com",
            pass: "fsrvuyynrofrojew",
          },
        });

        const mailOptions = {
          from: "TruScapes <no-reply@truscapes.com>",
          to,
          subject: "Update on Your Tru-Scapes® Order",
          text: "Your order has been updated",
          html: `
            
            <p>Hello ${user.firstName},</p>
            <p>We’ve got some news about your order  ${order._id}:</p>
            <p>Current Status: ${status}</p>
            <p>We’re working to ensure everything goes smoothly. If you have any questions or need more info, just reply to this email, and we’ll be happy to help.</p>
            <p>Best regards,</p>
            <p>The TruScapes Team</p>
          `,
          bcc,
        };

        Transport.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log("Error sending email: " + error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        return res.status(200).json({ error: false, message: "Order Updated" });
      }
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ error: true, message: "Internal Server Error" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

module.exports = { getOrders, updateOrderStatus };
