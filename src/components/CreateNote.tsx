"use client";

import { useEffect, useRef, useState } from "react";
import { Edit3Icon, ImageIcon, Mic, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNoteContext } from "@/context/NoteContext";

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function CreateNote() {
  const { setSelectedNoteId, setTranscript } = useNoteContext();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [localTranscript, setLocalTranscript] = useState<string>(""); // Local state for recording
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startRecording = () => {
    setIsRecording(true);

    if ("webkitSpeechRecognition" in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result: SpeechRecognitionResult) => result[0])
          .map((result: SpeechRecognitionAlternative) => result.transcript)
          .join("");

        console.log("Transcript:", transcript);
        setLocalTranscript(transcript);
      };

      recognitionRef.current.start();
    } else {
      console.error("Speech recognition not supported in this browser.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setTranscript(localTranscript); // Update context with the recorded transcript
      setTimeout(() => setSelectedNoteId("new-note"), 100); // Open modal
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

  const openModal = () => {
    setLocalTranscript(""); // Reset local transcript
    setTranscript(""); // Reset context transcript for manual note creation
    setSelectedNoteId("new-note");
  };

  return (
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
  );
}