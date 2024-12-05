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
            user: "drdwyn1@gmail.com",
            pass: "rzelwbvlrsdtkfoh",
          },
        });

        const mailOptions = {
          from: "TruScapes <no-reply@truscapes.com>",
          to,
          subject: "Order Delivered",
          text: "Your order has been delivered",
          html: `
            <h1>Order Delivered</h1>
            <p>Dear ${user.firstName},</p>
            <p>Your order has been delivered. Thank you for your purchase!</p>
            <p>Order Details:</p>
            <ul>
              ${order.products
                .map(
                  (product) =>
                    `<li>${product.name} - Quantity: ${product.quantity}</li>`
                )
                .join("")}
            </ul>
            <p>Thank you for your support!</p>
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
            user: "drdwyn1@gmail.com",
            pass: "rzelwbvlrsdtkfoh",
          },
        });

        const mailOptions = {
          from: "TruScapes <no-reply@truscapes.com>",
          to,
          subject: "Order Updated",
          text: "Your order has been updated",
          html: `
            <h1>Order Updated</h1>
            <p>Dear ${user.firstName},</p>
            <p>Your order has been updated to <strong>${status}</strong>. Thank you for your purchase!</p>
            <p>Order Details:</p>

            <ul>
              ${order.products
                .map(
                  (product) =>
                    `<li>${product.name} - Quantity: ${product.quantity}</li>`
                )
                .join("")}
            </ul>
            <p>Thank you for your support!</p>
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
