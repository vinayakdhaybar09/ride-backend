import mongoose, { Schema } from "mongoose";

const locationSchema = new Schema({
  latitude: { type: String, required: true },
  longitude: { type: String, required: true },
});

const rideSchema = new Schema(
  {
    startPoint: { locationSchema },
    endPoint: { locationSchema },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      enum: ["Driver", "Passanger"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "InActive", "Ongoing", "Completed"],
      required: true,
    },
    price: {
      type: Number,
      requird: true,
    },
    seats: {
      type: Number,
      required: true,
    },
    repeat: {
      type: String,
      enum: ["Once", "Daily", "MonToFri"],
      default: "Once",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    rideRequest:{
      type: Schema.Types.ObjectId,
      ref:"RideRequest"
    }
  },
  { timestamps: true }
);

export const Ride = mongoose.model("Ride", rideSchema);
