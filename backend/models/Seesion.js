import mongoose from "mongoose";
import { type } from "os";

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  data: {
    cart: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
  },
  expires: {
    type: Date,
    required:true,
    index: { expires: 0 }
  },
});

const Session = mongoose.model("Session", sessionSchema);

export default Session;