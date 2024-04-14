const axios = require("axios");
const userModel = require("../models/userModel");
const Transaction = require("../models/transactionModel");
const walletModel = require("../models/walletModel");
const ordersModel = require("../models/ordersModel");
var SDKConstants = require("authorizenet").Constants;
const itemsModel = require("../models/itemsModel");

var ApiContracts = require("authorizenet").APIContracts;
var APIControllers = require("authorizenet").APIControllers;

const CHAPA_URL =
  process.env.CHAPA_URL || "https://api.chapa.co/v1/transaction/initialize";
const CHAPA_AUTH = process.env.CHAPA_AUTH; // || register to chapa and get the key

const authorizePayment = async (
  { amount, card, cvv, expiryMonth, expiryYear },
  callback
) => {
  const merchantAuthenticationType =
    new ApiContracts.MerchantAuthenticationType();

  merchantAuthenticationType.setName("7K9cFk2Sr");
  merchantAuthenticationType.setTransactionKey("8p5D8n2QXuH4Cn8m");

  const creditCard = new ApiContracts.CreditCardType();
  creditCard.setCardNumber(card);
  creditCard.setExpirationDate(expiryMonth + "/" + expiryYear);
  creditCard.setCardCode(cvv);

  const paymentType = new ApiContracts.PaymentType();
  paymentType.setCreditCard(creditCard);

  const transactionSetting1 = new ApiContracts.SettingType();
  transactionSetting1.setSettingName("duplicateWindow");
  transactionSetting1.setSettingValue("120");

  var transactionSettingList = [];
  transactionSettingList.push(transactionSetting1);

  var transactionSettings = new ApiContracts.ArrayOfSetting();
  transactionSettings.setSetting(transactionSettingList);
  var transactionRequestType = new ApiContracts.TransactionRequestType();
  transactionRequestType.setTransactionType(
    ApiContracts.TransactionTypeEnum.AUTHONLYTRANSACTION
  );

  transactionRequestType.setPayment(paymentType);
  transactionRequestType.setAmount(amount);
  transactionRequestType.setTransactionSettings(transactionSettings);

  const createRequests = new ApiContracts.CreateTransactionRequest();
  createRequests.setMerchantAuthentication(merchantAuthenticationType);
  createRequests.setTransactionRequest(transactionRequestType);

  const ctrl = new APIControllers.CreateTransactionController(
    createRequests.getJSON()
  );

  ctrl.setEnvironment(SDKConstants.endpoint.production);

  //pretty print request
  console.log(JSON.stringify(createRequests.getJSON(), null, 2));

  ctrl.execute(async function () {
    var apiResponse = ctrl.getResponse();

    var response = new ApiContracts.CreateTransactionResponse(apiResponse);

    //pretty print response
    console.log(JSON.stringify(response, null, 2));

    if (response != null) {
      if (
        response.getMessages().getResultCode() ==
        ApiContracts.MessageTypeEnum.OK
      ) {
        if (response.getTransactionResponse().getMessages() != null) {
          console.log(
            "Successfully created transaction with Transaction ID: " +
              response.getTransactionResponse().getTransId()
          );
          console.log(
            "Response Code: " +
              response.getTransactionResponse().getResponseCode()
          );
          console.log(
            "Message Code: " +
              response
                .getTransactionResponse()
                .getMessages()
                .getMessage()[0]
                .getCode()
          );
          console.log(
            "Description: " +
              response
                .getTransactionResponse()
                .getMessages()
                .getMessage()[0]
                .getDescription()
          );
        } else {
          console.log("Failed Transaction.");
          if (response.getTransactionResponse().getErrors() != null) {
            console.log(
              "Error Code: " +
                response
                  .getTransactionResponse()
                  .getErrors()
                  .getError()[0]
                  .getErrorCode()
            );
            console.log(
              "Error message: " +
                response
                  .getTransactionResponse()
                  .getErrors()
                  .getError()[0]
                  .getErrorText()
            );
          }
        }
      } else {
        console.log("Failed Transaction.");
        if (
          response.getTransactionResponse() != null &&
          response.getTransactionResponse().getErrors() != null
        ) {
          console.log(
            "Error Code: " +
              response
                .getTransactionResponse()
                .getErrors()
                .getError()[0]
                .getErrorCode()
          );
          console.log(
            "Error message: " +
              response
                .getTransactionResponse()
                .getErrors()
                .getError()[0]
                .getErrorText()
          );
        } else {
          console.log(
            "Error Code: " + response.getMessages().getMessage()[0].getCode()
          );
          console.log(
            "Error message: " + response.getMessages().getMessage()[0].getText()
          );
        }
      }
    } else {
      console.log("Null Response.");
    }

    callback(response);
  });
};

const initializePayment = async (req, res) => {
  let {
    items,
    reason,
    amount,
    userID,
    addressLine1,
    addressLine2,
    city,
    pincode,
    paymentMethod,
    card,
    cvv,
    expiryMonth,
    expiryYear,
  } = req.body;

  console.log(items, reason, amount, userID);
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  let orders = items.map((item) => {
    return {
      category: item.category,
      name: item.name,
      product: item.product,
      quantity: item.quantity,
      price: item.price,
      imagePath: item.image,
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

    if (!paymentMethod || paymentMethod === "wallet") {
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
        description: " Debit for Order - ",
        balanceRemaining: parseFloat(user.wallet.balance) - parseFloat(amount),
      });

      newTransaction.description =
        newTransaction.description + newTransaction._id;

      await newTransaction.save();

      const newOrder = new ordersModel({
        transactionId: newTransaction._id,
        userId: userID,
        price: amount,
        products: [],
        shippingAddress: {
          addressLine1,
          addressLine2,
          city,
          pincode: Number(pincode),
        },
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

      return res
        .status(201)
        .json({ error: false, message: "Order successful" });
    } else {
      // initiating the transaction
      authorizePayment(
        {
          amount,
          card,
          cvv,
          expiryMonth,
          expiryYear,
        },
        async (response) => {
          if (response != null) {
            if (
              response.getTransactionResponse() != null &&
              response.getTransactionResponse().getErrors() != null
            ) {
              res.status(200).json({
                error: true,
                message: response
                  .getTransactionResponse()
                  .getErrors()
                  .getError()[0]
                  .getErrorText(),
              });
            } else {
              const newOrder = new ordersModel({
                transactionId: response.getTransactionResponse().getTransId(),
                userId: userID,
                price: amount,
                products: [],
                shippingAddress: {
                  addressLine1,
                  addressLine2,
                  city,
                  pincode: Number(pincode),
                },
              });

              newOrder.forEach((order) => {
                newOrder.products.push(order);
              });

              await newOrder.save();
              return res
                .status(201)
                .json({ error: false, message: "Order Successful" });
            }
          } else {
            return res
              .status(200)
              .json({ error: true, message: "Internal Server Error" });
          }
        }
      );
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: true, message: "Internal Srever Error" });
  }

  /////////////////////////////////////////////////////////////////////////////////////
};

const payCreditBalance = async (req, res) => {
  const { card, cvv, expiryMonth, expiryYear } = req.body;

  if (!req.user) {
    return res
      .status(403)
      .json({ error: true, message: "Unauthorized :  token" });
  }

  if (!card || !cvv || !expiryMonth || !expiryYear) {
    return res
      .status(200)
      .json({ error: true, message: "Missing credit card details" });
  }

  const user = await userModel
    .findById(req.user._id)
    .populate("credit")
    .populate("wallet");
  if (!user) {
    return res.status(404).json({ error: true, message: "User not found" });
  }

  if (user.credit.credit <= 0) {
    return res
      .status(200)
      .json({ error: true, message: "You do not have any credit to repay." });
  }

  authorizePayment(
    {
      amount: user.credit.credit,
      card,
      cvv,
      expiryMonth,
      expiryYear,
    },
    async (response) => {
      if (response != null) {
        if (
          response.getTransactionResponse() != null &&
          response.getTransactionResponse().getErrors() != null
        ) {
          res.status(200).json({
            error: true,
            message: response
              .getTransactionResponse()
              .getErrors()
              .getError()[0]
              .getErrorText(),
          });
        } else {
          // const newCredit = user.credit.credit - user.credit.credit;
          await userModel.findByIdAndUpdate(user._id, {
            credit: 0,
          });
          return res
            .status(201)
            .json({ error: false, message: "Payment Successful" });
        }
      } else {
        return res
          .status(500)
          .json({ error: true, message: "Internal Server Error" });
      }
    }
  );
};

module.exports = { initializePayment, payCreditBalance };
