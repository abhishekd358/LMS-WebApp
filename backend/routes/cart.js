import express from "express";
import Session from "../models/Seesion.js";
import Cart from "../models/Cart.js";


const router = express.Router();

// GET cart
router.get("/", async (req, res) => {
  //  check is user has the guesId or not 
   let guestId =  req.signedCookies.guestId;

   if(!guestId){
    return res.json([])
   }

  // now find in the cart 
   const cart = await Cart.findOne({ guestId }).populate("courses.courseId");

   if (!cart) return res.json([]);

   res.json(cart.courses);
});

// Add to cart
router.post("/", async (req, res) => {

  try {
    const {courseId}= req.body // receive from froentedn

  //  check is user has the guesId or not 
   let guestId =  req.signedCookies.guestId;

  // 1️⃣ if guest id not present means we have to create new guest session
   if(!guestId){
    const session = await Session.create({expires: new Date(Date.now() + 60*60 *1000)  // 1 hour
    })
    guestId = session._id.toString(); // update the guestId  and send to frontend

    // as we create new session we send in cookies to frontend
    res.cookie('guestId',guestId,{
      httpOnly: true,
      maxAge:60 * 60 * 1000,
      sameSite: "lax",
      signed: true
    })
  }

  // 2️⃣ now finding the guestId cart Data
  let cart = await Cart.findOne({guestId})

  // if no cart then we create new cart and add courseId to it 
  if(!cart){
   cart = await Cart.create({
      guestId, 
      courses:[{courseId, quantity: 1}],
    })
  }else{
    //  we going to check the courseId is present in array then we not add else we add
    const item = cart.courses.find((c)=>c.courseId.toString()=== courseId)

    if(item){
      item.quantity += 1; // increase the item quantity
    }else{
      cart.courses.push({ courseId, quantity: 1 })
    }
  }
  await cart.save();
  return res.status(200).json({
  message: "Added to cart",
  cart,})
  } catch (error) {
      console.log(error.message)
      return res.json(error.message)
  }
   
});

// Remove course from cart
router.delete("/:courseId", async (req, res) => {
  // first we check is there present a guestid or not 
  let guestId = req.signedCookies.guestId

  //  take the coursId through params
  const {courseId} = req.params

  // if not guestId 
  if(!guestId) return res.json({message: "404 Errror Session Not found", success: false})

  // now we find guestId in our Cart is present or not
  const cartData = await Cart.findOne({guestId})

     if (!cartData) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

  // now we remove the courseId from the courses 
  const item = cartData.courses.find((item)=>item.courseId.toString() === courseId)

  if(!item){
    return res.status(404).json({
        success: false,
        message: "Item not in cart",
      });
  }


  // otherwise if find the course Id that we wnat to remove
      if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      cartData.courses = cartData.courses.filter(
        (i) => i.courseId.toString() !== courseId
      );
    }

    await cartData.save()
    
    console.log("removed")
    return res.status(200).json({
      success: true,
      message: "Item removed",
      cart:cartData,
    });

});

// Clear cart
router.delete("/", async (req, res) => {
  //Add your code here
});

export default router;

















// 1 user - courses if from body 
