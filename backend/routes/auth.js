import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Session from "../models/Seesion.js";
import Cart from "../models/Cart.js";

const router = express.Router();

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    // console.log('from server', req.body)
    // check this req body exists with required data
    if(!email || !password || !name){
      return res.json({message:"All field required", success: false})
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
    });
    await user.save();


    res.status(201).json({
      message: "User registered successfully",success:true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "All fields required" });
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // 1️⃣ Load existing session (guest)
  let session = req.signedCookies.sid
    ? await Session.findById(req.signedCookies.sid)
    : null;

  if (!session) {
    session = await Session.create({});
  }

  // 2️⃣ Attach user to session
  session.userId = user._id;
  await session.save();

  // 3️⃣ Merge session cart → user cart
  let cart = await Cart.findOne({ userId: user._id });
  if (!cart) {
    cart = await Cart.create({ userId: user._id, courses: [] });
  }

  for (const sItem of session.data.cart || []) {
    const cItem = cart.courses.find(
      i => i.courseId.toString() === sItem.courseId.toString()
    );

    if (cItem) cItem.quantity += sItem.quantity;
    else cart.courses.push(sItem);
  }

  await cart.save();

  // 4️⃣ Clear session cart
  session.data.cart = [];
  await session.save();

  // 5️⃣ Set cookies
  res.cookie("sid", session._id, {
    httpOnly: true,
    signed: true,
    sameSite: "lax",
  });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "24h",
  });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
  });

  res.json({ success: true, message: "Login successful" });
});


// logout route
router.delete("/logout", async (req, res) => {
  try {
    const sid = req.signedCookies.sid;

    if (!sid) {
      return res.status(400).json({
        success: false,
        message: "No active session",
      });
    }

    const session = await Session.findById(sid);
    if (!session) {
      return res.status(400).json({
        success: false,
        message: "Session not found",
      });
    }

    // 1️⃣ Detach user from session
    session.userId = null;
    session.data.cart = []; // optional (Amazon clears temp cart)
    await session.save();

    // 2️⃣ Remove auth token
    res.clearCookie("token");
    // keep sid cookie (important)

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
});

export default router;
