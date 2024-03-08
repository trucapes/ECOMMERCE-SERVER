const axios = require("axios");
const userModel = require("../models/userModel");
const Transaction = require("../models/transactionModel");
const walletModel = require("../models/walletModel");
const ordersModel = require("../models/ordersModel");
const itemsModel = require("../models/itemsModel");

const CHAPA_URL =
  process.env.CHAPA_URL || "https://api.chapa.co/v1/transaction/initialize";
const CHAPA_AUTH = process.env.CHAPA_AUTH; // || register to chapa and get the key

const initializePayment = async (req, res) => {
  const { items, reason, amount, userID } = req.body;

  // console.log(items, reason, amount, userID);
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  let orders = items.map((item) => {
    return {
      product: item.product,
      quantity: item.quantity,
      price: item.price,
    };
  });

  console.log(orders);

  try {
    //find the user in the database

    const user = await userModel.findById(userID).populate("wallet");
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    //check if amount is less than the balance

    if (user.wallet.balance < amount) {
      console.log(user.wallet._id, "\ninsufficient balance");
      return res
        .status(200)
        .json({ error: false, message: "Insufficient balance" });
    }

    //Suppose We have the product,that are in the cart, are in stock. Initiating the Transaction

    const newTransaction = new Transaction({
      user: userID,
      amount: amount * -1,
      description: "Order Debit Transaction",
      balanceRemaining: parseFloat(user.wallet.balance) - parseFloat(amount),
    });

    await newTransaction.save();

    const newOrder = new ordersModel({
      transactionId: newTransaction._id,
      userId: userID,
      price: amount,
      products: [],
    });

    orders.forEach((order) => {
      newOrder.products.push(order);
    });

    try {
      await newOrder.save();
    } catch (error) {
      console.log(error);
    }

    // Update wallet balance

    await walletModel.findByIdAndUpdate(user.wallet._id, {
      balance: user.wallet.balance - amount,
    });

    user.wallet.balance -= amount;
    await user.save();
    // Return response
    console.log("sahi");

    return res.status(201).json({ error: false, message: "Order successful" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal Srever Error" });
  }

  /////////////////////////////////////////////////////////////////////////////////////

  //find the wallet of the user

  //   const wallet = console.log("\n\nuser", user);
  // const config = {
  //     headers: {
  //         Authorization: CHAPA_AUTH
  //     }
  // }

  // // chapa redirect you to this url when payment is successful
  // const CALLBACK_URL = "http://localhost:3000"

  // // a unique reference given to every transaction
  // const TEXT_REF = "tx-myecommerce12345-" + Date.now()

  // // form data
  // const data = {
  //     amount: req.body.amount,
  //     currency: 'ETB',
  //     email: 'ato@ekele.com',
  //     first_name: 'Ato',
  //     last_name: 'Ekele',
  //     tx_ref: TEXT_REF,
  //     callback_url: CALLBACK_URL
  // }

  // // post request to chapa
  // await axios.post(CHAPA_URL, data, config)
  //     .then((response) => {
  //         res.send(response.data.data.checkout_url)
  //         console.log(response.data)
  //     })
  //     .catch((err) => console.log(err))

  /* res.json({res: "message", url: CALLBACK_URL}) */
};

const verifyPayment = async (req, res) => {
  await axios
    .get("https://api.chapa.co/v1/transaction/verify/" + req.params.id, config)
    .then((response) => {
      console.log(response);
      res.json({ message: response });
    })
    .catch((err) => {
      console.log("Payment can't be verfied", err);
      res.json({ error: err });
    });

  res.json({ message: "response", param: req.params.id });
};

module.exports = { initializePayment, verifyPayment };
