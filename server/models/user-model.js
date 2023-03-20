const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 30,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["student", "instructor"],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Instance methods
userSchema.methods.isInstructor = function () {
  return this.role == "instructor";
};

userSchema.methods.isStudent = function () {
  return this.role == "student";
};

userSchema.methods.comparePassword = async function (password, cb) {
  let result;
  try {
    result = await bcrypt.compare(password, this.password);
    return cb(null, result);
  } catch (e) {
    return cb(e, result);
  }
};

// mongoose middleware
// 使用者為新用戶或正在更改密碼，將密碼進行雜湊處理
userSchema.pre("save", async function (next) {
  // this = mongodb內的document
  if (this.isNew || this.isModified("password")) {
    const hashValue = await bcrypt.hash(this.password, 10);
    this.password = hashValue;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
