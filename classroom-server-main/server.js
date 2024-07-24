const mongoose = require("mongoose");
const express = require("express");
const path = require('path');
const jwt = require("jsonwebtoken");
const User = require("./models/user.js");
const Class = require("./models/class.js");
const Post = require("./models/post.js");
const Feed = require("./models/feed.js");

const multer = require('multer');
const { extname } = require('path');
const fs = require('fs');
const { authenticateToken } = require('./middleware/authenticateToken.js');
const { generateToken } = require("./config/auth.js");

// import { generateToken } from './config/auth.js';

require("dotenv").config();


const app = express();
const port = 9000;


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Multer file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/files");
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// Middleware to authenticate JWT token
// Generate JWT token


// Define routes
app.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/register", (req, res) => {
  res.json({ message: "Display the register page" });
});

app.get("/createclass", authenticateToken, (req, res) => {
  res.json({ message: "Display the create class page" });
});

app.get("/login", (req, res) => {
  res.json({ message: "Display the login page" });
});

app.get("/logout", (req, res) => {
  res.json({ message: "not logged in" });
});

app.get('/enrolledclasses', authenticateToken, async (req, res) => {
  try {
    const classids = req.user.classenrolled;
    const enrolledClasses = await Class.find({ _id: { $in: classids } });
    res.json(enrolledClasses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/ownedclasses', authenticateToken, async (req, res) => {
  try {
    const classids = req.user.classowned;
    const classowned = await Class.find({ _id: { $in: classids } });
    res.json(classowned);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/createclass', authenticateToken, async (req, res) => {
  try {
    const existingClass = await Class.findOne({ classCode: req.body.classCode });
    if (existingClass) {
      return res.status(400).json({ error: 'Class code already exists' });
    }

    // console.log(req.user)
    // console.log(req.body)

    const clas = new Class({
      createdByName: req.user.firstName,
      createdByID: req.user._id,
      createdByusername: req.user.username,
      classTitle: req.body.classTitle,
      classYear: req.body.classYear,
      classSection: req.body.classSection,
      classDesc: req.body.classDesc,
      classCode: req.body.classCode
    });

    await clas.save();
    const feed = new Feed({
      classId: clas._id,
      posts: [],
    });

    await feed.save();

    await User.findByIdAndUpdate(
      { _id: req.user._id },
      { $push: { classowned: clas._id } }
    );
    return res.json({ message: "Class created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/joinclass', authenticateToken, async (req, res) => {
  try {
    const classCode = req.body.classCode;
    const userId = req.user._id;
    const classToJoin = await Class.findOne({ classCode: classCode });

    if (!classToJoin) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (!classToJoin.userAccepting) {
      return res.status(400).json({ message: 'Class is not accepting new users' });
    }

    const isParticipant = classToJoin.participants.includes(userId);
    if (isParticipant) {
      return res.status(400).json({ message: 'Already joined the class' });
    }

    if (classToJoin.createdByID.equals(userId)) {
      return res.status(400).json({ message: 'User is the creator of the class' });
    }

    classToJoin.participants.push(userId);
    await classToJoin.save();

    await User.updateOne(
      { _id: userId },
      { $push: { classenrolled: classToJoin._id } }
    );

    res.json({ message: 'Successfully joined the class' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/class/:classId", authenticateToken, async (req, res) => {
  const { classId } = req.params;
  console.log("req", req);
  try {
    const foundClass = await Class.findOne({
      _id: classId,
      participants: req.user._id
    }).exec();

    if (!foundClass) {
      return res.status(403).json({ message: "User is not enrolled in the class" });
    }

    const participantIds = foundClass.participants;
    const participantDetails = await User.find(
      { _id: { $in: participantIds } },
      "firstName lastName username"
    ).exec();

    res.json({ classData: foundClass, participants: participantDetails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/class/:classId/feed", authenticateToken, upload.single('file'), async (req, res) => {
  const { classId } = req.params;
  const { content } = req.body;
  const authorId = req.user._id;
  const fileName = req.file ? req.file.filename : null;

  try {
    const foundClass = await Class.findById(classId);
    if (!foundClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    const newPost = new Post({
      content,
      author: authorId,
      classId: classId,
      fileName,
    });
    await newPost.save();

    const foundFeed = await Feed.findOneAndUpdate(
      { classId },
      { $push: { posts: newPost._id } },
      { new: true }
    );

    const tempost = {
      _id: newPost._id,
      author: {
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        username: req.user.username
      },
      content: content,
      fileName: fileName,
      createdAt: newPost.createdAt,
    };

    res.json({ message: "Post added successfully", post: tempost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/class/:classId/feed", authenticateToken, async (req, res) => {
  try {
    const { classId } = req.params;

    const foundFeed = await Feed.findOne({ classId });

    if (!foundFeed) {
      return res.status(404).json({ message: "Feed not found" });
    }

    const postDetails = [];

    for (let i = foundFeed.posts.length - 1; i >= 0; i--) {
      const postId = foundFeed.posts[i];
      const post = await Post.findById(postId)
        .populate("author", "firstName lastName username")
        .select("content fileName createdAt");

      postDetails.push(post);
    }

    res.json({ posts: postDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Serve files with conditions
app.get("/files/:filename",(req, res) => {
  const { filename } = req.params;
  res.sendFile(path.join(__dirname, "public", "files", filename));
});

// Delete a specific post
app.delete(
  "/posts/:classId/feed/:postId",
  authenticateToken,
  async (req, res) => {
    try {
      const { classId, postId } = req.params;

      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (post.fileName) {
        const filePath = path.join(__dirname, "public", "files", post.fileName);
        fs.unlinkSync(filePath);
      }

      await Post.findByIdAndDelete(postId);

      await Feed.findOneAndUpdate({ classId }, { $pull: { posts: postId } });

      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// Get class owner details and participants
app.get("/class/owner/:classId", authenticateToken, async (req, res) => {
  const { classId } = req.params;

  try {
    const foundClass = await Class.findOne({
      _id: classId,
      createdBy: req.user._id,
    }).exec();

    if (!foundClass) {
      return res
        .status(403)
        .json({ message: "User is not the creator of the class" });
    }

    const participantIds = foundClass.participants;
    const participantDetails = await User.find(
      { _id: { $in: participantIds } },
      "firstName lastName username"
    ).exec();

    res.json({ classData: foundClass, participants: participantDetails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Class owner removing a user
app.delete(
  "/class/:classId/participants/:userId",
  authenticateToken,
  async (req, res) => {
    const { classId, userId } = req.params;
    const classOwner = req.user._id;

    try {
      const foundClass = await Class.findById(classId);
      if (!foundClass) {
        return res.status(404).json({ message: "Class not found" });
      }

      if (classOwner.toString() !== foundClass.createdByID.toString()) {
        return res
          .status(403)
          .json({ message: "Only the class owner can remove participants" });
      }

      await Class.findByIdAndUpdate(classId, {
        $pull: { participants: userId },
      });
      await User.findByIdAndUpdate(userId, {
        $pull: { classEnrolled: classId },
      });

      const deletedPosts = await Post.find({ author: userId, classId });
      await Post.deleteMany({ author: userId, classId });

      const foundFeed = await Feed.findOne({ classId });
      foundFeed.posts = foundFeed.posts.filter(
        (postId) =>
          !deletedPosts
            .map((post) => post._id.toString())
            .includes(postId.toString())
      );
      await foundFeed.save();

      res.json({ message: "Participant removed successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// Get user acceptance state for a class
app.get(
  "/class/:classId/user-acceptance",
  authenticateToken,
  async (req, res) => {
    try {
      const { classId } = req.params;
      const foundClass = await Class.findById(classId);
      if (!foundClass) {
        return res.status(404).json({ message: "Class not found" });
      }
      const { userAccepting } = foundClass;
      res.json({ userAccepting });
    } catch (error) {
      console.error("Error fetching user acceptance state:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// Toggle user acceptance state for a class
app.put(
  "/class/:classId/useracceptance",
  authenticateToken,
  async (req, res) => {
    const { classId } = req.params;
    const { userAccepting } = req.body;
    const classOwner = req.user._id;

    try {
      const foundClass = await Class.findById(classId);
      if (!foundClass) {
        return res.status(404).json({ message: "Class not found" });
      }

      if (classOwner.toString() !== foundClass.createdByID.toString()) {
        return res
          .status(403)
          .json({ message: "Only the class owner can toggle user acceptance" });
      }

      const updatedClass = await Class.findByIdAndUpdate(
        classId,
        { userAccepting },
        { new: true }
      );

      res.json({ userAccepting: updatedClass.userAccepting });
    } catch (error) {
      console.error("Error toggling user acceptance state:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// Owner changing the details of the class
app.patch("/class/:classId", authenticateToken, async (req, res) => {
  const { classId } = req.params;
  const { classTitle, classYear, classSection, classDesc } = req.body;
  const userId = req.user._id;

  try {
    const foundClass = await Class.findById(classId);
    if (!foundClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (!foundClass.createdByID.equals(userId)) {
      return res
        .status(403)
        .json({ message: "Only the class owner can update class details" });
    }

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      {
        classTitle: classTitle || foundClass.classTitle,
        classYear: classYear || foundClass.classYear,
        classSection: classSection || foundClass.classSection,
        classDesc: classDesc || foundClass.classDesc,
      },
      { new: true }
    );

    res.json({ updatedClass });
  } catch (error) {
    console.error("Error updating class details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Check login status
app.get("/auth", authenticateToken, (req, res) => {
  const userdata = {
    fname: req.user.firstName,
    lname: req.user.lastName,
    username: req.user.username,
  };
  res.json({ isLoggedIn: true, user: userdata });
});

// Authentication routes
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  // cout <<
  console.log(username,password);
  try {
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }


    if (user && (await user.matchPassword(password))) {

      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        password: user.password,
        token: generateToken(user),
      });
    }
    
    
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/register", async (req, res) => {
  try {
    console.log(req.body); // Log the entire request body

    const { firstName, lastName, username, password } = req.body;

      // if (!name|| !email || !password) {
      //   res.status(400);
      //   throw new Error("Please Enter all the Feilds");
      // }
    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Create a new user
    const user = new User({
      firstName,
      lastName,
      username,
      password, 
    });

    await user.save();

    if(user){
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        password: user.password,
        token: generateToken(user)
      })
    }

    console.log("User created successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Serve static files
// app.use(express.static(path.join(__dirname, "../client/public")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../client/public/index.html"));
// });

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
