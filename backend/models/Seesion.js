import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    expires: { //Date.now()/1000 + 60*60
      type: Date,
      // default: Date.now()/1000 + 60*60,
      required: true,
    },
  },
  { timestamps: true }
);

// singular model name is best practice
const Session = mongoose.model("Session", sessionSchema);

export default Session;
