const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Create a Mongoose schema and model
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    username: { type: String, required: true },
    password: { type: String, required: true },
    classowned: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    classenrolled: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    this.password = await bcrypt.hash(this.password, 10); // Hash password before saving
  }
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  console.log(enteredPassword, this.password);
  const x =  await bcrypt.compare(enteredPassword, this.password);
  console.log("OKK")
  return x;
};


const User = mongoose.model("User", userSchema);
module.exports = User;
