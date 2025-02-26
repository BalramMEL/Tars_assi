"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Play, Star, Upload, Share2, X, Maximize2Icon, Trash, Download, Pause, Edit3Icon, Minimize2Icon } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import axios from "axios";
import TabBar from "./TabBar";
import { MaximizedNoteModal } from "./MaximizedNoteModal";
import { useNoteContext } from "@/context/NoteContext";

export default function NoteModal() {
  const {
    user,
    notes,
    selectedNoteId,
    transcript, // Access transcript from context
    setSelectedNoteId,
    fetchNotes,
    renameNote,
  } = useNoteContext();

  const selectedNote = notes.find((note) => note._id === selectedNoteId) || null;
  const isOpen = !!selectedNoteId;

  const [isEditing, setIsEditing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isFavorited, setIsFavorited] = useState(selectedNote?.isFavorite || false);
  const [uploadedImages, setUploadedImages] = useState<string[]>(selectedNote?.images || []);
  const [formData, setFormData] = useState({
    userId: user?._id || "",
    title: selectedNote?.title || "New Note",
    noteContent: selectedNote?.noteContent || (selectedNoteId === "new-note" ? transcript : ""), // Use transcript for new note
    isFavorite: selectedNote?.isFavorite || false,
    images: selectedNote?.images || [],
    noteIsRecorded: selectedNote?.noteIsRecorded || (selectedNoteId === "new-note" && transcript.length > 0),
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  useEffect(() => {
    if (selectedNote) {
      setUploadedImages(selectedNote.images);
      setIsFavorited(selectedNote.isFavorite);
      setFormData({
        userId: user?._id || "",
        title: selectedNote.title || "New Note",
        noteContent: selectedNote.noteContent || "",
        noteIsRecorded: selectedNote.noteIsRecorded || false,
        images: selectedNote.images || [],
        isFavorite: selectedNote.isFavorite || false,
      });
    } else if (selectedNoteId === "new-note") {
      setUploadedImages([]);
      setIsFavorited(false);
      setFormData({
        userId: user?._id || "",
        title: "New Note",
        noteContent: transcript, // Initialize with transcript for new note
        noteIsRecorded: transcript.length > 0,
        images: [],
        isFavorite: false,
      });
    }
  }, [selectedNote, selectedNoteId, user, transcript]);

  const togglePlay = () => {
    if (!synthRef.current) return;
    if (isPlaying) {
      synthRef.current.pause();
    } else {
      if (!utteranceRef.current) {
        utteranceRef.current = new SpeechSynthesisUtterance(formData.noteContent);
        utteranceRef.current.onend = () => setIsPlaying(false);
      }
      synthRef.current.speak(utteranceRef.current);
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...uploadedImages];
    newImages.splice(index, 1);
    setUploadedImages(newImages);
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formData.noteContent);
    toast.success("Copied to clipboard!");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return false;
    }
    if (!formData.noteContent.trim()) {
      toast.error("Note content is required");
      return false;
    }
    return true;
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (!validateForm()) {
      setIsSaving(false);
      return;
    }

    try {
      if (selectedNoteId && selectedNoteId !== "new-note") {
        await axios.put(`http://localhost:3000/api/notes/${selectedNoteId}`, formData);
        toast.success("Note updated successfully!");
      } else {
        const response = await axios.post("http://localhost:3000/api/notes", formData);
        toast.success("Note created successfully!");
        if (response.data?.note?._id) {
          setFormData((prev) => ({ ...prev, id: response.data.note._id }));
        }
      }
      await fetchNotes();
      setIsSaving(false);
      setSelectedNoteId(null);
    } catch (error: any) {
      setIsSaving(false);
      toast.error(error.response?.data?.message || "Failed to save note");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const convertToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
    };

    try {
      const base64Images = await Promise.all(Array.from(files).map(convertToBase64));
      setUploadedImages((prevImages) => [...prevImages, ...base64Images]);
      setFormData((prevForm) => ({
        ...prevForm,
        images: [...prevForm.images, ...base64Images],
      }));
    } catch (error) {
      toast.error("Failed to process images");
      console.error("Image processing error:", error);
    }
  };

  const handleFavorite = () => {
    setIsFavorited((prev) => {
      const newFavoriteStatus = !prev;
      setFormData((prevForm) => ({ ...prevForm, isFavorite: newFavoriteStatus }));
      return newFavoriteStatus;
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: formData.title,
          text: formData.noteContent,
        });
        toast.success("Note shared successfully!");
      } catch (error) {
        toast.error("Failed to share the note.");
        console.error("Sharing error:", error);
      }
    } else {
      toast.error("Sharing not supported in this browser.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => setSelectedNoteId(null)}>
      <DialogContent className={`${isFullscreen ? "w-full h-full max-w-none" : "max-w-2xl"}`}>
        <DialogHeader className="flex flex-col">
          <div className="flex justify-between items-center w-full">
            <Button
              className="p-2 rounded-full bg-gray-300"
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2Icon className="w-5 h-5" /> : <Maximize2Icon className="w-5 h-5" />}
            </Button>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavorite}
                className="p-2 rounded-full bg-gray-300"
              >
                <Star className={`w-5 h-5 ${isFavorited ? "text-yellow-500 fill-yellow-500" : "text-gray-500"}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="p-2 rounded-full bg-gray-300"
              >
                <Share2 className="w-5 h-5 text-gray-500" />
              </Button>
              <DialogClose asChild className="p-2 rounded-full bg-gray-300">
                <Button variant="ghost" size="sm">
                  <X className="h-5 w-5" />
                </Button>
              </DialogClose>
            </div>
          </div>
          <div className="mt-2 w-full">
            <DialogTitle className="text-lg font-semibold text-start mt-2">
              {isEditing ? (
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  onBlur={() => {
                    setIsEditing(false);
                    if (selectedNoteId) renameNote(selectedNoteId, formData.title);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setIsEditing(false);
                      if (selectedNoteId) renameNote(selectedNoteId, formData.title);
                    }
                  }}
                  autoFocus
                  className="border rounded-md p-1"
                />
              ) : (
                <span onClick={() => setIsEditing(true)} className="cursor-pointer flex items-center gap-3">
                  {formData.title || selectedNote?.title} <Edit3Icon className="w-4 h-4 opacity-50" />
                </span>
              )}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col">
          <div className="flex items-center w-full space-x-2 p-2 border border-gray-300 rounded-full">
            <button onClick={togglePlay} className="p-1 border rounded-full border-gray-300 bg-black">
              {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
            </button>
            <div className="relative flex-grow">
              <input
                type="range"
                min="0"
                max={audioRef.current?.duration || 0}
                value={currentTime}
                onChange={(e) => {
                  const newTime = Number(e.target.value);
                  if (audioRef.current) audioRef.current.currentTime = newTime;
                  setCurrentTime(newTime);
                }}
                className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, orange ${((currentTime / (audioRef.current?.duration || 1)) * 100)}%, #e5e7eb 0%)`,
                }}
              />
            </div>
            <span className="text-xs text-gray-600 w-16 text-right">{formatTime(currentTime)} / 00:05</span>
            <a download onClick={() => {}} className="cursor text-xs text-gray-500 flex items-center space-x-1 border rounded-2xl border-gray-300 px-2 py-1">
              <Download className="w-4 h-4" />
              <span>Download Audio</span>
            </a>
          </div>
          <div className="mt-3 border-gray-300 rounded-full w-max">
            <TabBar />
          </div>
        </div>

        <div className="flex flex-col mt-1 border rounded-2xl border-gray-300">
          <div className="flex items-center justify-between p-2">
            <p className="text-md font-semibold">Transcript</p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" className="rounded-2xl opacity-60" size="sm" onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-1" /> Copy
              </Button>
              <Button variant="outline" className="rounded-2xl opacity-60" size="sm" onClick={() => setIsMaximized(true)}>
                <Maximize2Icon className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Textarea
            className="border-none p-2 rounded-md focus:border-none"
            value={formData.noteContent}
            onChange={handleChange}
            name="noteContent"
            style={{ outline: "none", border: "none", textDecorationLine: "none", textDecoration: "none" }}
          />
        </div>

        <MaximizedNoteModal
          isOpen={isMaximized}
          onClose={() => setIsMaximized(false)}
          content={formData.noteContent}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData((prev) => ({ ...prev, noteContent: e.target.value }))}
        />

        <div className="flex items-center space-x-2">
          {uploadedImages.map((src, index) => (
            <div key={index} className="relative w-16 h-16 border rounded-lg overflow-hidden">
              <Image src={src} alt={`Uploaded ${index}`} layout="fill" objectFit="cover" className="rounded-lg" />
              <button
                className="absolute top-0 right-0 bg-white p-1 rounded-full shadow-md"
                onClick={() => handleRemoveImage(index)}
              >
                <Trash className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ))}
          <label className="w-16 h-16 flex flex-col items-center justify-center border border-dashed rounded-lg cursor-pointer">
            <Upload className="w-6 h-6 text-gray-400" />
            <span className="text-xs text-gray-500">Image</span>
            <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageUpload} />
          </label>
        </div>

        <div className="flex justify-end mt-4 space-x-2">
          <Button variant="destructive" onClick={() => setSelectedNoteId(null)}>Cancel Note</Button>
          <Button variant="outline" onClick={handleSaveNote} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Note"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}