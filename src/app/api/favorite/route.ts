import { NextResponse } from "next/server";
import mongoose from "mongoose";
import SingleNote from "../models/card-details-model";
import { connectDB } from "../config/db";

// Connect to the database
await connectDB();

// GET endpoint to fetch favorite notes

export async function GET(req:Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // Validate userId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing userId" },
        { status: 400 }
      );
    }

    // Fetch notes where isFavorite is true for the given user
    const favoriteNotes = await SingleNote.find({ userId, isFavorite: true });

    return NextResponse.json({ success: true, notes: favoriteNotes }, { status: 200 });
  } catch (error) {
    console.error("Error fetching favorite notes:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}