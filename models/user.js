const mongoose = require("mongoose");
const uri = "mongodb+srv://1831gkumar:grv%40123@cluster0.l8fn9i7.mongodb.net/learn?retryWrites=true&w=majority&appName=Cluster0";


const userSchema = new mongoose.Schema({
   googleId: {
    type: String,
    unique: true,
    sparse: true,
    required: function () {
      return !this.password;  // ✅ Only required if password is missing
    }
  },
  displayName: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  photo: String,
  username: String,
  password: {
    type: String,
    required: function () {
      return !this.googleId; // ✅ Only required if googleId is missing
    }
  }
});


module.exports = mongoose.model("user", userSchema);
