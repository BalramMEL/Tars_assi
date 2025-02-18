import mongoose, { Schema } from "mongoose";

const NoteSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },
  title: { type: String, required: true, default: "" },
  noteContent: { type: String, required: true, default: "" },
  isFavorite: { type: Boolean, default: false },
  noteIsRecorded: { type: Boolean, default: false },
  images: { type: [String], default: [], required: false },
  creationDate: { type: Date, default: Date.now, required: true }, // Add creationDate
});

const SingleNote =
  mongoose.models.SingleNote || mongoose.model("SingleNote", NoteSchema);

export default SingleNote;
