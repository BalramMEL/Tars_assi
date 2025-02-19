import { v2 as cloudinary } from "cloudinary";

import { NextResponse } from "next/server";
import { connectDB } from "../config/db";
import SingleNote from "../models/card-details-model";

import mongoose from "mongoose";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  await connectDB();

  try {
    const body = await req.json();
    const { userId, title, noteContent, isFavorite, images, noteIsRecorded } = body;
    console.log("Received Images:", images);

    // Validate required fields
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing userId" },
        { status: 400 }
      );
    }

    if (!title.trim() || !noteContent.trim()) {
      return NextResponse.json(
        { success: false, message: "Title and Note Content are required" },
        { status: 400 }
      );
    }

    let uploadedImages = [];

    // Upload images to Cloudinary
    if (images && images.length > 0) {
      const uploadPromises = images.map(async (image: string) => {
        try {
          const result = await cloudinary.uploader.upload(image, {
            folder: "events",
          });
          return result.secure_url; 
        } catch (error) {
          console.error("Cloudinary upload error:", error);
          throw new Error("Failed to upload images");
        }
      });

      uploadedImages = await Promise.all(uploadPromises);
    }

    // Create a new note
    const note = await SingleNote.create({
      userId: new mongoose.Types.ObjectId(userId), // Ensure ObjectId format
      title,
      noteContent,
      isFavorite,
      images: uploadedImages,
      noteIsRecorded,
      creationDate: new Date(),
    });

    return NextResponse.json({ success: true, note }, { status: 201 });

  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}


// Get all notes for a user
export async function GET(req: Request) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing userId" },
        { status: 400 }
      );
    }

    const notes = await SingleNote.find({ userId });

    return NextResponse.json({ success: true, notes }, { status: 200 });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}



