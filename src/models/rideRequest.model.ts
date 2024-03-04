import mongoose, { Schema } from "mongoose";

const locationSchema = new Schema({
  latitude: { type: String, required: true },
  longitude: { type: String, required: true },
});

const rideRequestSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    startPoint: { locationSchema },
    endPoint: { locationSchema },
  },
  { timestamps: true }
);

export const RideRequest = mongoose.model("RideRequest", rideRequestSchema);
