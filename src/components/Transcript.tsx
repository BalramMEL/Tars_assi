"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import NoteModal from "./NoteModal";
import toast from "react-hot-toast";

export interface TranscriptProps {
  id: string;
  title: string;
  content: string;
  noteIsRecorded?: boolean;
  isFavorite?: boolean;
  images?: string[];
  duration?: string;
  onRename: (id: string, newTitle: string) => void;
}

export default function Transcript({
  id,
  title,
  content,
  noteIsRecorded = false,
  isFavorite = false,
  images = [],
  duration,
  onRename
}: TranscriptProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  const handleTranscriptClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col mt-1 border rounded-2xl border-gray-300">
        <div className="flex items-center justify-between p-2">
          <p className="text-md font-semibold">Transcript</p>
          <Button variant="outline" className="rounded-2xl opacity-60" size="sm" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-1" /> Copy
          </Button>
        </div>
        <div 
          className="p-2 rounded-md cursor-pointer min-h-[100px] text-gray-800 hover:bg-gray-50"
          onClick={handleTranscriptClick}
        >
          {content ? (
            <p>{content}</p>
          ) : (
            <p className="text-gray-400 italic">
              It seems like the input you provided doesn't contain any meaningful text or transcript to format. If you have a specific transcript
              or text you'd like me to format, please provide that, and I'll be happy to help!
            </p>
          )}
        </div>
      </div>

      {/* Modal */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        id={id}
        title={title}
        content={content}
        noteIsRecorded={noteIsRecorded}
        isFavorite={isFavorite}
        images={images}
        duration={duration}
        onRename={onRename}
      />
    </>
  );
}