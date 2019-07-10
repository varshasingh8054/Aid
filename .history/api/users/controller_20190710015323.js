const { userServices } = require("../services/index");
const jwtToken = require("../../lib/auth");
const { EMAIL, USER_TYPE } = require("../../lib/constant");
const { SUCCESS_MESSAGE, ERROR_MESSAGE } = require("../../lib/message");
const commonFunctions = require("../../lib/common");
const path = require("path");
const emailProvider = require("../../lib/email-provider");
const logger = require("../../lib/logger");
const mongoose = require("mongoose").Types;
const crypto = require("crypto");
const customError = require("../../lib/custom-error");
const util = require("../../lib/util");
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
        socialUser.existingUser = true;
        socialUser.apiMsg = "Account Created";
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
          sessionData: { email: socialUser["email"] }
        });
        let new1 = {};
        
        new1.accessToken1 = accessToken;

        let test = Object.assign(socialUser, new1);
        console.log("got !!"test);

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
          data: new1
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

  // async forgotPassword(req, res) {
  //   try {
  //     console.log(
  //       "------------------In forgot password API------------------------------"
  //     );
  //     let payload = req.body;

  //     let user = await commonFunctions.validateEmail(payload);
  //     console.log("Validated email by searching in DB = ", user);
  //     if (user) {
  //       const token = crypto.randomBytes(20).toString("hex");
  //       console.log("New token created = > ", token);
  //       user.resetPasswordtoken = token;
  //       console.log(
  //         " ==========  Token copied to resetpassword token ============ ",
  //         user.resetPasswordtoken
  //       );
  //       user.resetPasswordexpires = Date.now() + 360000;
  //       console.log(
  //         "  ================= Token expires in ============ ",
  //         user.resetPasswordexpires
  //       );
  //       user.save();
  //       console.log(user);

  //       console.log(user.email);
  //       console.log(
  //         "-----------------Fullname of user is --------------",
  //         user.fullName
  //       );

  //       const msg = `

  //         <!DOCTYPE html>
  //         <html>
  //         <head>
  //           <meta charset="utf-8">
  //           <meta http-equiv="x-ua-compatible" content="ie=edge">
  //           <title>Password Reset</title>
  //           <meta name="viewport" content="width=device-width, initial-scale=1">
  //           <style type="text/css">
  //           /**
  //            * Google webfonts. Recommended to include the .woff version for cross-client compatibility.
  //            */
  //           @media screen {
  //             @font-face {
  //               font-family: 'Source Sans Pro';
  //               font-style: normal;
  //               font-weight: 400;
  //               src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff) format('woff');
  //             }
  //             @font-face {
  //               font-family: 'Source Sans Pro';
  //               font-style: normal;
  //               font-weight: 700;
  //               src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff) format('woff');
  //             }
  //           }
  //           /**
  //            * Avoid browser level font resizing.
  //            * 1. Windows Mobile
  //            * 2. iOS / OSX
  //            */
  //           body,
  //           table,
  //           td,
  //           a {
  //             -ms-text-size-adjust: 100%; /* 1 */
  //             -webkit-text-size-adjust: 100%; /* 2 */
  //           }
  //           /**
  //            * Remove extra space added to tables and cells in Outlook.
  //            */
  //           table,
  //           td {
  //             mso-table-rspace: 0pt;
  //             mso-table-lspace: 0pt;
  //           }
  //           /**
  //            * Better fluid images in Internet Explorer.
  //            */
  //           img {
  //             -ms-interpolation-mode: bicubic;
  //           }
  //           /**
  //            * Remove blue links for iOS devices.
  //            */
  //           a[x-apple-data-detectors] {
  //             font-family: inherit !important;
  //             font-size: inherit !important;
  //             font-weight: inherit !important;
  //             line-height: inherit !important;
  //             color: inherit !important;
  //             text-decoration: none !important;
  //           }
  //           /**
  //            * Fix centering issues in Android 4.4.
  //            */
  //           div[style*="margin: 16px 0;"] {
  //             margin: 0 !important;
  //           }
  //           body {
  //             width: 100% !important;
  //             height: 100% !important;
  //             padding: 0 !important;
  //             margin: 0 !important;
  //           }
  //           /**
  //            * Collapse table borders to avoid space between cells.
  //            */
  //           table {
  //             border-collapse: collapse !important;
  //           }
  //           a {
  //             color: #1a82e2;
  //           }
  //           img {
  //             height: auto;
  //             line-height: 100%;
  //             text-decoration: none;
  //             border: 0;
  //             outline: none;
  //           }
  //           </style>

  //         </head>
  //         <body style="background-color: #e9ecef;">

  //           <!-- start preheader -->
  //           <div class="preheader" style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
  //             A preheader is the short summary text that follows the subject line when an email is viewed in the inbox.
  //           </div>
  //           <!-- end preheader -->

  //           <!-- start body -->
  //           <table border="0" cellpadding="0" cellspacing="0" width="100%">

  //             <!-- start logo -->
  //             <tr>
  //               <td align="center" bgcolor="#e9ecef">
  //                 <!--[if (gte mso 9)|(IE)]>
  //                 <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
  //                 <tr>
  //                 <td align="center" valign="top" width="600">
  //                 <![endif]-->
  //                 <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
  //                   <tr>
  //                     <td align="center" valign="top" style="padding: 36px 24px;">
  //                       <a href="http://latchaid.com/" target="_blank" style="display: inline-block;">
  //                         <img src="https://i0.wp.com/latchaid.com/wp-content/uploads/2018/08/cropped-Screen-Shot-2018-08-06-at-3.18.59-PM.png?fit=1239%2C932" alt="Logo" border="0" width="48" style="display: block; width: 150px; max-width: 150px; min-width: 150px;">
  //                       </a>
  //                     </td>
  //                   </tr>
  //                 </table>
  //                 <!--[if (gte mso 9)|(IE)]>
  //                 </td>
  //                 </tr>
  //                 </table>
  //                 <![endif]-->
  //               </td>
  //             </tr>
  //             <!-- end logo -->

  //             <!-- start hero -->
  //             <tr>
  //               <td align="center" bgcolor="#e9ecef">
  //                 <!--[if (gte mso 9)|(IE)]>
  //                 <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
  //                 <tr>
  //                 <td align="center" valign="top" width="600">
  //                 <![endif]-->
  //                 <!--[if (gte mso 9)|(IE)]>
  //                 </td>
  //                 </tr>
  //                 </table>
  //                 <![endif]-->
  //               </td>
  //             </tr>
  //             <!-- end hero -->

  //             <!-- start copy block -->
  //             <tr>
  //               <td align="center" bgcolor="#e9ecef">
  //                 <!--[if (gte mso 9)|(IE)]>
  //                 <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
  //                 <tr>
  //                 <td align="center" valign="top" width="600">
  //                 <![endif]-->
  //                 <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
  //                 <tr>
  //                 <td align="center" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">
  //                   <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">Reset Your Password</h1>
  //                 </td>
  //                  </tr>

  //                   <tr>
  //                     <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
  //                       <p style="margin: 0;">Hello!! ${
  //                         user.fullName
  //                       } <br> Click the button below to reset your account password. If you didn't request a new password, you can safely delete this email.</p>
  //                     </td>
  //                   </tr>
  //                   <!-- end copy -->

  //                   <!-- start button -->
  //                   <tr>
  //                     <td align="left" bgcolor="#ffffff">
  //                       <table border="0" cellpadding="0" cellspacing="0" width="100%">
  //                         <tr>
  //                           <td align="center" bgcolor="#ffffff" style="padding: 12px;">
  //                             <table border="0" cellpadding="0" cellspacing="0">
  //                               <tr>
  //                                 <td align="center" bgcolor="#1a82e2" style="border-radius: 6px;">
  //                                   <a href="http://35.177.246.53:7000/api/users/reset/${token}" target="_blank" style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;">Reset Password</a>
  //                                 </td>
  //                               </tr>
  //                             </table>
  //                           </td>
  //                         </tr>
  //                       </table>
  //                     </td>
  //                   </tr>
  //                   <!-- end button -->

  //                   <!-- start copy -->
  //                   <tr>
  //                     <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
  //                       <p style="margin: 0;">If that doesn't work, copy and paste the following link in your browser:</p>
  //                       <p style="margin: 0;"><a href="http://35.177.246.53:7000/api/users/reset/${token}" target="_blank">http://35.177.246.53:7000/api/users/reset/${token}</a></p>
  //                     </td>
  //                   </tr>
  //                   <!-- end copy -->

  //                   <!-- start copy -->
  //                   <tr>
  //                     <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf">
  //                       <p style="margin: 0;">Cheers,<br> Paste</p>Tap
  //                     </td>
  //                   </tr>
  //                   <!-- end copy -->

  //                 </table>
  //                 <!--[if (gte mso 9)|(IE)]>
  //                 </td>
  //                 </tr>
  //                 </table>
  //                 <![endif]-->
  //               </td>
  //             </tr>
  //             <!-- end copy block -->

  //             <!-- start footer -->
  //             <tr>
  //               <td align="center" bgcolor="#e9ecef" style="padding: 24px;">
  //                 <!--[if (gte mso 9)|(IE)]>
  //                 <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
  //                 <tr>
  //                 <td align="center" valign="top" width="600">
  //                 <![endif]-->
  //                 <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">

  //                   <!-- start permission -->
  //                   <tr>
  //                     <td align="center" bgcolor="#e9ecef" style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;">
  //                       <p style="margin: 0;">You received this email because we received a request for [type_of_action] for your account. If you didn't request [type_of_action] you can safely delete this email.</p>
  //                     </td>
  //                   </tr>

  //                 </table>
  //                 <!--[if (gte mso 9)|(IE)]>
  //                 </td>
  //                 </tr>
  //                 </table>
  //                 <![endif]-->
  //               </td>
  //             </tr>
  //             <!-- end footer -->

  //           </table>
  //           <!-- end body -->

  //         </body>
  //         </html>

  //         `;

  //       let transporter = nodemailer.createTransport({
  //         host: "smtp.gmail.com",
  //         port: 465,
  //         secure: true,
  //         auth: {
  //           user: config.email,
  //           pass: config.pass
  //         },
  //         tls: {
  //           rejectUnauthorized: false
  //         }
  //       });
  //       let mailOptions = {
  //         from: '"LatchAid"<latchaid.dev@gmail.com>',
  //         to: req.body.email,
  //         subject: "Password Reset Email",
  //         text: "This is Password Reset Email",
  //         html: msg
  //       };
  //       transporter.sendMail(mailOptions, (error, info) => {
  //         if (error) {
  //           return console.log(error);
  //         }
  //         console.log("Message sent: %s", info.messageId);
  //       });
  //       console.log("mail sent");

  //       res.send({
  //         code: 400,
  //         message: SUCCESS_MESSAGE.PASSWORD_RESET_LINK_SENT
  //       });
  //     } else {
  //       console.log("1");
  //       res.send({
  //         code: 400,
  //         message: ERROR_MESSAGE.EMAIL_NOT_EXISTS
  //       });
  //     }
  //   } catch (err) {
  //     console.log("2");
  //     res.send({
  //       code: 400,
  //       message: ERROR_MESSAGE.ERROR,
  //       data: err.stack
  //     });
  //   }
  // }

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
