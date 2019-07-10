const { userServices } = require("../services/index");
const jwtToken = require("../../lib/auth");
// const { EMAIL ,USER_TYPE } = require('../../lib/constant');
const { SUCCESS_MESSAGE, ERROR_MESSAGE } = require("../../lib/message");
const commonFunctions = require("../../lib/common");
// const path = require('path');
// const emailProvider = require('../../lib/email-provider');
const logger = require("../../lib/logger");
// const mongoose = require('mongoose').Types;
const crypto = require("crypto");
const customError = require("../../lib/custom-error");
// const util = require('../../lib/util')
const nodemailer = require("nodemailer");

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require("node-localstorage").LocalStorage;
  localStorage = new LocalStorage("./mylocalStor");
}
class Controller {
  async create(req, res, next) {
    try {
      // ------------------ In register API --------------------
      let payload = req.body;
      console.log("------------ Payload Data => -----------------", req.body);
      let validateEmail = await commonFunctions.validateEmail(payload);

      // console.log("Validated email by searching in DB = ", validateEmail);
      if (validateEmail) {
        console.log(
          "-------------User Already Exists------------",
          validateEmail
        );
        return res.send({
          code: 400,
          message: ERROR_MESSAGE.EMAIL_EXIST
        });
      } else {
        console.log(
          "---------------------Registering the user ---------------------"
        );

        let socialUser = await userServices.createUser(payload);
        socialUser["existingUser"] = true;
        socialUser["apiMsg"] = "Account Created";
        // let {
        //   _id,
        //   email,
        //   socialType,
        //   socialId,
        //   fullName,
        //   firstName,
        //   lastName,
        //   contactNumber,
        //   selectAge,
        //   selectChildAge,
        //   timeForBreastfeeding,
        //   interestedForBreastfeeding,
        //   lat,
        //   long,
        //   imageUrl,
        //   location,
        //   pregnancyMonth,
        //   accessToken
        // } = socialUser;

        // let existingUser = true;
        // Creating access token
        let accessToken = jwtToken.createJWToken({
          sessionData: { email }
        });
        socialUser["accessToken"] = accessToken;
        // let newUserCreated = {
        //   existingUser,
        //   firstName,
        //   lastName,
        //   fullName,
        //   imageUrl,
        //   email,
        //   socialType,
        //   socialId,
        //   contactNumber,
        //   selectAge,
        //   selectChildAge,
        //   timeForBreastfeeding,
        //   interestedForBreastfeeding,
        //   lat,
        //   long,
        //   location,
        //   pregnancyMonth,
        //   accessToken,
        //   apiMsg: "Account Created"
        // };

        return res.send({
          code: 200,
          message: SUCCESS_MESSAGE.REGISTER_SUCCESS,
          data: socialUser
        });
      }
    } catch (err) {
      return res.send({
        code: 400,
        message: ERROR_MESSAGE.ERROR,
        data: err.stack
      });
    }
  }

  async login(req, res, next) {
    try {
      console.log(
        "----------------------------------------------In login API---------------------------------------"
      );

      let payload = req.body;
      console.log("------------ Payload Data => -----------------", req.body);

      if (payload.socialType == "normal") {
        console.log(
          "----------------------In normal login condition ----------------------"
        );

        let user = await commonFunctions.validateEmail(payload);
        console.log("Validated email by searching in DB = ", user);
        if (user) {
          user.comparePassword(req.body.password, (err, isMatch) => {
            if (err)
              return res.send({
                code: 400,
                message: ERROR_MESSAGE.ERROR,
                data: err.stack
              });
            if (!isMatch)
              return res.send({
                code: 400,
                message: ERROR_MESSAGE.INVALID_PWD
              });
            // let {
            //   _id,
            //   fullName,
            //   firstName,
            //   lastName,
            //   email,
            //   password,
            //   contactNumber,
            //   selectAge,
            //   selectChildAge,
            //   timeForBreastfeeding,
            //   interestedForBreastfeeding,
            //   lat,
            //   long,
            //   location,
            //   imageUrl,
            //   socialType,
            //   socialId,
            //   pregnancyMonth
            // } = user;

            // Creating access token
            let accessToken = jwtToken.createJWToken({
              sessionData: {
                email
              }
            });

            user["accessToken"] = accessToken;
            user["existingUser"] = true;
            user["apiMsg"] = "Normal Login";

            // let newUser = {
            //   existingUser,
            //   fullName,
            //   firstName,
            //   lastName,
            //   email,
            //   password,
            //   contactNumber,
            //   selectAge,
            //   selectChildAge,
            //   timeForBreastfeeding,
            //   interestedForBreastfeeding,
            //   lat,
            //   long,
            //   location,
            //   imageUrl,
            //   socialType,
            //   socialId,
            //   accessToken,
            //   pregnancyMonth,
            //   apiMsg: "Normal Login"
            // };
            return res.send({
              code: 200,
              message: SUCCESS_MESSAGE.LOGIN_SUCCESS,
              data: user
            });
          });
        } else {
          return res.send({
            code: 400,
            message: ERROR_MESSAGE.EMAIL_NOT_EXISTS
          });
        }
      } else if (
        payload.socialType == "google" ||
        payload.socialType == "facebook"
      ) {
        console.log("In social login condition");

        let user = await commonFunctions.validateEmail(payload);
        console.log("Validated email by searching in DB = ", user);

        if (!user) {
          return res.send({
            code: 400,
            message: ERROR_MESSAGE.EMAIL_NOT_EXISTS
          });
        } else {
          // let {
          //   _id,
          //   fullName,
          //   firstName,
          //   lastName,
          //   email,
          //   password,
          //   contactNumber,
          //   selectAge,
          //   selectChildAge,
          //   timeForBreastfeeding,
          //   interestedForBreastfeeding,
          //   lat,
          //   long,
          //   location,
          //   imageUrl,
          //   socialType,
          //   socialId,
          //   pregnancyMonth
          // } = user;

          let accessToken = jwtToken.createJWToken({
            sessionData: { email }
          });

          user["existingUser"] = true;
          user["accessToken"] = accessToken;
          user["apiMsg"] = "login social id success";
          // let newUser = {
          //   existingUser,
          //   fullName,
          //   firstName,
          //   lastName,
          //   email,
          //   password,
          //   contactNumber,
          //   selectAge,
          //   selectChildAge,
          //   timeForBreastfeeding,
          //   interestedForBreastfeeding,
          //   lat,
          //   long,
          //   location,
          //   imageUrl,
          //   socialType,
          //   socialId,
          //   accessToken,
          //   pregnancyMonth,
          //   apiMsg: "login social id success"
          // };
          console.log("------------ User is loggedin--------------- ", newUser);
          // logger.logResponse(req.id, res.statusCode, 200);
          // let apiMsg = "Logged In Successfully";
          res.send({
            code: 200,
            message: SUCCESS_MESSAGE.LOGIN_SUCCESS,
            data: user
          });
        }
      }
    } catch (err) {
      res.send({
        code: 400,
        message: ERROR_MESSAGE.ERROR,
        data: err.stack
      });
    }
  }

  async changePassword(req, res) {
    if (req.user) {
      let payload = req.body;
      let { _id, email } = req.user;
      payload.email = email;
      let user = await commonFunctions.validateEmail(payload);
      user.comparePassword(payload.oldPassword, async function(err, isMatch) {
        if (err)
          return res.send({
            status: 0,
            code: 404,
            message: ERROR_MESSAGE.ERROR,
            data: err.stack
          });
        if (!isMatch)
          return res.send({
            status: 0,
            code: 404,
            message: ERROR_MESSAGE.INVALID_OLD_PWD
          });
        try {
          user.password = payload.newPassword;
          let updatedUser = await userServices.saveUser(user);
          res.send({
            status: 1,
            code: 200,
            message: SUCCESS_MESSAGE.SUCCESS,
            data: updatedUser
          });
        } catch (err) {
          res.send({
            status: 0,
            code: 404,
            message: ERROR_MESSAGE.ERROR,
            data: err.stack
          });
        }
      });
    } else {
      res.send({ status: 0, code: 404, message: ERROR_MESSAGE.INVALID_AUTH });
    }
  }

  async forgotPassword(req, res) {
    try {
      let payload = req.body;
      let user = await commonFunctions.validateEmail(payload);
      if (user) {
        console.log("This is given email " + req.body.email);
        const token = crypto.randomBytes(20).toString("hex");
        console.log(token);
        (user.resetPassword.token = token),
          (user.resetPassword.expires = Date.now() + 360000);
        user.save();
        console.log("This is user " + user);
        const output = `
                    <p>Click <a href="http://localhost:3000/api/users/reset/${token}/${
          req.body.email
        }">here</a> to reset password.</p>
                `;

        let transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "varsha.stepsonyou8054@gmail.com",
            pass: "Var8054@"
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        let mailOptions = {
          from: '"MEAN Demo" <varsha.stepsonyou8054@gmail.com>',
          to: req.body.email,
          subject: "Reset Email!",
          text: "This is Reset Email.",
          html: output
        };
        transporter.sendMail(mailOptions, function(err, response) {
          if (err) {
            console.error("there was an error: ", err);
          } else {
            console.log("here is the res: ", response);
            res.json({
              status: 1,
              code: 200,
              message: SUCCESS_MESSAGE.SUCCESS
            });
          }
        });
      } else {
        console.log("wrong email");
        res.json({
          status: 0,
          code: 404,
          message: ERROR_MESSAGE.INVALID_EMAIL,
          data: err.stack
        });
      }
    } catch (err) {
      res.send({
        status: 0,
        code: 404,
        message: ERROR_MESSAGE.ERROR,
        data: err.stack
      });
    }
  }

  async resetPassword(req, res, next) {
    try {
      let payload = req.params;
      let user = await commonFunctions.validateEmail(payload);
      if (user) {
        let token = payload.token;
        let usertoken = user.resetPassword.token;
        if (token !== usertoken) {
          return next(new customError(ERROR_MESSAGE.INVALID_OTP));
        } else {
          if (token == usertoken) {
            localStorage.setItem("email1", req.params.email);
            //               res.sendFile(path.join(__dirname, '../../public', 'reset.html'));
            res.redirect("http://localhost:4200/resetpassword");
          }
        }
      }
    } catch (err) {
      res.send({
        status: 0,
        code: 404,
        message: ERROR_MESSAGE.ERROR,
        data: err.stack
      });
    }
  }

  async updatePassword(req, res, next) {
    try {
      let payload = req.body;
      var email1 = localStorage.getItem("email1");
      let user = await commonFunctions.validateEmail(payload);
      if (user) {
        user.password = payload.password;
        user.resetPassword.token = null;
        user.resetPassword.expires = null;
        localStorage.setItem("email1", " ");
        res.json({ status: 1, msg: "password updated" });
        await userServices.saveUser(user);
      } else {
        res.status(404).json("no user exists in db to update");
      }
    } catch (err) {
      res.send({
        status: 0,
        code: 404,
        message: ERROR_MESSAGE.ERROR,
        data: err.stack
      });
    }
  }

  async fileUpload(req, res) {
    var formidable = require("formidable");
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      res.send({ files: files });
    });
  }

  async userDetails() {}
}
module.exports = new Controller();
