import { Ride } from "../models/ride.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";

const createRide = asyncHandler(async (req: Request, res: Response) => {
  const {
    startPoint,
    endPoint,
    date,
    time,
    mode,
    status,
    price,
    seats,
    repeat,
  } = req.body;

  if (
    [startPoint, endPoint, date, time, mode, status, price, seats, repeat].some(
      (field) => field === ""
    )
  ) {
    throw new ApiError(400, "All field are required");
  }

  const ride = await Ride.create({
    startPoint,
    endPoint,
    date,
    time,
    mode,
    status,
    price,
    seats,
    repeat,
  });

  const createdRide = await Ride.findById(ride._id);

  if (!ride) {
    throw new ApiError(500, "Something went wrong while creating ride");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdRide, "Ride created successfully"));
});

const getRideByUserId = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) {
    throw new ApiError(400, "user is required");
  }



});

