"use client";

import { useEffect, useRef, useState } from "react";
import { Edit3Icon, ImageIcon, Mic, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import NoteModal from "./NoteModal";
// import axios from "axios";
// import toast from "react-hot-toast";

declare global{
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export default function CreateNote() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  // const [recordingComplete, setRecordingComplete] = useState<boolean>(false);
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

      console.log("Transcript:",transcript);
      setTranscript(transcript);
    };

    recognitionRef.current.start();
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setIsModalOpen(true);
    }
  }

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  })

  const handleToggleRecording = () => {
    setIsLoading(!isRecording);
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  }

  return (
     <>
      <div className="fixed bottom-6 flex justify-center w-[70%] right-16 items-center bg-white shadow-lg rounded-full px-4 py-2 space-x-3 border">
        <button onClick={() => setIsModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 transition">
          <Edit3Icon />
        </button>
        <button onClick={() => setIsModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 transition">
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

      {/* Render the NoteModal when isModalOpen is true */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        id="new-note"
        title="New Note"
        content={transcript}
        noteIsRecorded={transcript.length > 0 ? true : false}
        onRename={(id, newTitle) => {
          // Handle renaming logic here
          console.log(`Renamed note ${id} to ${newTitle}`);
        }}
      />
    </>
  );
}
