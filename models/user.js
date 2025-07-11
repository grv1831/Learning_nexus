const mongoose = require("mongoose");
const uri = "mongodb+srv://1831gkumar:grv%40123@cluster0.l8fn9i7.mongodb.net/learn?retryWrites=true&w=majority&appName=Cluster0";


const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  displayName: String,
  email: String,
  photo: String
});

module.exports = mongoose.model("user", userSchema);
