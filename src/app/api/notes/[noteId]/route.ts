import { NextResponse } from "next/server";
import { connectDB } from "../../config/db";
import SingleNote from "../../models/card-details-model";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// DELETE a note
export async function DELETE(req: Request, { params }: { params: { noteId: string } }) {
  await connectDB();

  try {
    const { noteId } = params;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return NextResponse.json(
        { success: false, message: "Invalid noteId" },
        { status: 400 }
      );
    }

    const deletedNote = await SingleNote.findByIdAndDelete(noteId);

    if (!deletedNote) {
      return NextResponse.json(
        { success: false, message: "Note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Note deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

//  UPDATE an existing note
export async function PUT(req: Request, { params }: { params: { noteId: string } }) {
  await connectDB();

  try {
    const { noteId } = params;
    const body = await req.json();
    const { title, noteContent, isFavorite, images, noteIsRecorded } = body;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return NextResponse.json(
        { success: false, message: "Invalid noteId" },
        { status: 400 }
      );
    }

    if (!title.trim() || !noteContent.trim()) {
      return NextResponse.json(
        { success: false, message: "Title and Note Content are required" },
        { status: 400 }
      );
    }

    // 🌟 Optimize Image Uploads (Only Upload New Images)
    let uploadedImages = images || [];

    if (images && images.length > 0) {
      const uploadPromises = images.map(async (image: string) => {
        if (image.startsWith("http")) return image; // Skip re-upload if it's already a URL

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

    const updatedNote = await SingleNote.findByIdAndUpdate(
      noteId,
      { title, noteContent, isFavorite, images: uploadedImages, noteIsRecorded },
      { new: true, runValidators: true }
    );

    if (!updatedNote) {
      return NextResponse.json(
        { success: false, message: "Note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, updatedNote }, { status: 200 });

  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json({ success: false, error: (error as Error).message  }, { status: 500 });
  }
}
