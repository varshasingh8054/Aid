const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const SALT_WORK_FACTOR = 10;

const UserSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true
    },
    lastName: String,
    email: { type: String, required: true },
    password: { type: String, required: true },
    verificationCode: {
      token: { type: String, default: null },
      two_factor_temp_secret: { type: String, default: null }
    },
    userType: { type: Number, default: null },
    resetPassword: {
      token: { type: String, default: null },
      expires: { type: Number, default: 0 }
    },
    isUserUpdatedOnce: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

// const UserSchema = mongoose.Schema(
//   {
//     fullName: {
//       type: String,
//       default: ""
//     },
//     firstName: {
//       type: String,
//       default: ""
//     },
//     lastName: {
//       type: String,
//       default: ""
//     },
//     email: {
//       type: String,
//       lowercase: true,
//       required: true
//     },
//     socialType: {
//       type: String,
//       enum: ["facebook", "google", "normal"],
//       default: "normal"
//     },
//     isVerified: {
//       type: Boolean,
//       default: true
//     },
//     password: {
//       type: String
//     },
//     resetPasswordtoken: {
//       type: String,
//       default: ""
//     },
//     resetPasswordexpires: {
//       type: Number,
//       default: 0
//     },
//     contactNumber: {
//       type: String,
//       default: ""
//     },
//     selectAge: {
//       type: String,
//       default: 0
//     },
//     selectChildAge: {
//       type: String,
//       default: 0
//     },
//     location: {
//       type: String,
//       default: ""
//     },
//     lat: {
//       type: Number,
//       default: 0
//     },
//     long: {
//       type: Number,
//       default: 0
//     },
//     imageUrl: {
//       type: String,
//       default: ""
//     },
//     timeForBreastfeeding: {
//       type: String,
//       default: ""
//     },
//     interestedForBreastfeeding: {
//       type: String,
//       default: ""
//     },
//     socialId: {
//       type: String,
//       default: ""
//     },
//     pregnancyMonth: {
//       type: String,
//       default: ""
//     },
//     deliveryDate: {
//       type: Date,
//       default: ""
//     },
//     rate: {
//       type: String,
//       default: ""
//     },
//     feedback: {
//       type: String,
//       default: ""
//     },
//     chatGroup: []
//   },
//   {
//     timestamps: true
//   }
// );

UserSchema.pre("save", function(next) {
  let user = this;
  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();
  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);
    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

UserSchema.set("toObject");

module.exports = mongoose.model("users", UserSchema);
