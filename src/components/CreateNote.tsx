"use client";

import { useEffect, useRef, useState } from "react";
import { Edit3Icon, ImageIcon, Mic, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import NoteModal from "./NoteModal";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export default function CreateNote() {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);

  const startRecording = () => {
    setIsRecording(true);

    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join("");

      console.log("Transcript:", transcript);
      setTranscript(transcript);
    };

    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      // We'll open the modal after stopping recording
      setTimeout(() => setIsModalOpen(true), 100);
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleToggleRecording = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  // The key here is to create a standalone function for opening the modal
  // that doesn't immediately call setState which can cause rerenders
  const openModal = () => {
    if (!isModalOpen) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-6 flex justify-center w-[70%] right-16 items-center bg-white shadow-lg rounded-full px-4 py-2 space-x-3 border">
        <button
          onClick={openModal}
          className="p-2 rounded-full hover:bg-gray-200 transition"
        >
          <Edit3Icon />
        </button>
        <button
          onClick={openModal}
          className="p-2 rounded-full hover:bg-gray-200 transition"
        >
          <ImageIcon />
        </button>

        <div className="flex-1"></div>

        <Button
          onClick={handleToggleRecording}
          className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-md"
        >
          {!isRecording ? <Mic /> : <Pause />}
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Button>
      </div>

      {/* Only render when modal should be open */}
      {isModalOpen && (
        <NoteModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          id="new-note"
          title="New Note"
          content={transcript}
          noteIsRecorded={transcript.length > 0}
          onRename={(id, newTitle) => {
            console.log(`Renamed note ${id} to ${newTitle}`);
          }}
        />
      )}
    </>
  );
}