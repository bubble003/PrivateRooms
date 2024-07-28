const mongoose = require("mongoose");

// Define the schema for the "feed" collection
const feedSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
});

// Create the "feed" model
const Feed = mongoose.model("Feed", feedSchema);
module.exports = Feed
