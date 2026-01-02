import express from "express";
import Session from "../models/Seesion.js";
import Cart from "../models/Cart.js";
import Course from "../models/Course.js";


const router = express.Router();

// GET cart
router.get("/", async (req, res) => {
  const sid = req.signedCookies.sid;
  if (!sid) return res.json([]);

  const session = await Session.findById(sid);

  // 🔵 LOGGED-IN USER
  if (session.userId) {
    const cart = await Cart.findOne({ userId: session.userId })
      .populate("courses.courseId");

    return res.json(cart?.courses || []);
  }

  // 🟡 GUEST USER — POPULATE MANUALLY
  const courseIds = session.data.cart.map((i) => i.courseId);

  const courses = await Course.find({ _id: { $in: courseIds } });

  const populatedGuestCart = session.data.cart.map((item) => {
    const course = courses.find(
      (c) => c._id.toString() === item.courseId.toString()
    );

    return {
      courseId: course, // 🔥 same shape as logged-in cart
      quantity: item.quantity,
    };
  });

  return res.json(populatedGuestCart);
});



// Add to cart
router.post("/", async (req, res) => {
  const { courseId } = req.body;
  let session = await Session.findById(req.signedCookies.sid);

  if (!session) {
    session = await Session.create({});
    res.cookie("sid", session._id, { httpOnly: true, signed: true });
  }

  if (session.userId) {
    // user cart
    let cart = await Cart.findOne({ userId: session.userId });
    if (!cart) cart = await Cart.create({ userId: session.userId, courses: [] });

    const item = cart.courses.find(i => i.courseId.toString() === courseId);
    if (item) item.quantity++;
    else cart.courses.push({ courseId, quantity: 1 });

    await cart.save();
    return res.json(cart.courses);
  }

  // guest cart
  const item = session.data.cart.find(i => i.courseId.toString() === courseId);
  if (item) item.quantity++;
  else session.data.cart.push({ courseId, quantity: 1 });

  await session.save();
  res.json(session.data.cart);
});


// Remove course from cart
router.delete("/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const sid = req.signedCookies.sid;

    if (!sid) {
      return res.status(401).json({
        success: false,
        message: "Session not found",
      });
    }

    const session = await Session.findById(sid);
    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Invalid session",
      });
    }

    // ============================
    // 🔵 LOGGED-IN USER CART
    // ============================
    if (session.userId) {
      const cart = await Cart.findOne({ userId: session.userId });

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: "Cart not found",
        });
      }

      const item = cart.courses.find(
        (i) => i.courseId.toString() === courseId
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Item not in cart",
        });
      }

      if (item.quantity > 1) {
        item.quantity -= 1;
      } else {
        cart.courses = cart.courses.filter(
          (i) => i.courseId.toString() !== courseId
        );
      }

      await cart.save();

      return res.json({
        success: true,
        message: "Item removed",
        cart: cart.courses,
      });
    }

    // ============================
    // 🟡 GUEST CART (SESSION)
    // ============================
    const item = session.data.cart.find(
      (i) => i.courseId.toString() === courseId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not in guest cart",
      });
    }

    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      session.data.cart = session.data.cart.filter(
        (i) => i.courseId.toString() !== courseId
      );
    }

    await session.save();

    return res.json({
      success: true,
      message: "Item removed",
      cart: session.data.cart,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


// Clear cart
router.delete("/", async (req, res) => {
  //Add your code here
});

export default router;








// 1 user - courses if from body 
