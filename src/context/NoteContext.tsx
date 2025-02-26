"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

interface Note {
  _id: string;
  title: string;
  noteContent: string;
  noteIsRecorded: boolean;
  images: string[];
  creationDate: string;
  isFavorite: boolean;
}

interface User {
  _id: string;
  username: string;
  avatarUrl?: string;
}

interface NoteContextType {
  user: User | null;
  notes: Note[];
  isFetchingUser: boolean;
  searchQuery: string;
  viewMode: "all" | "favorites";
  sortOrder: "newest" | "oldest";
  selectedNoteId: string | null;
  transcript: string; // Add transcript to context
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: "all" | "favorites") => void;
  setSortOrder: (order: "newest" | "oldest") => void;
  setSelectedNoteId: (id: string | null) => void;
  setTranscript: (transcript: string) => void; // Add setter for transcript
  handleLogout: () => Promise<void>;
  fetchNotes: () => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  renameNote: (id: string, newTitle: string) => void;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const NoteProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isFetchingUser, setIsFetchingUser] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"all" | "favorites">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/fetch-user")
      .then((response) => setUser(response.data.user))
      .catch((error) => console.error("Error fetching user:", error))
      .finally(() => setIsFetchingUser(false));
  }, []);

  useEffect(() => {
    if (!isFetchingUser && user === null) {
      router.push("/log-in");
    }
  }, [isFetchingUser, user, router]);

  const fetchNotes = async () => {
    if (!user) return;
    const endpoint =
      viewMode === "all"
        ? `http://localhost:3000/api/notes?userId=${user._id}`
        : `http://localhost:3000/api/favorite?userId=${user._id}`;
    try {
      const response = await axios.get(endpoint);
      setNotes(response.data.notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [user, viewMode]);

  const handleLogout = async () => {
    try {
      const response = await axios.post("http://localhost:3000/api/log-out");
      toast.success(response.data.message);
      router.push("/log-in");
    } catch (error) {
      toast.error("Failed to log out.");
      console.error("Logout error:", error);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete note");
      setNotes(notes.filter((note) => note._id !== id));
      toast.success("Note deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete note");
    }
  };

  const renameNote = (id: string, newTitle: string) => {
    setNotes(notes.map((note) => (note._id === id ? { ...note, title: newTitle } : note)));
  };

  const filteredNotes = notes
    .filter((note) => {
      const query = searchQuery.toLowerCase();
      return note.title.toLowerCase().includes(query) || note.noteContent.toLowerCase().includes(query);
    })
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime();
      } else {
        return new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime();
      }
    });

  return (
    <NoteContext.Provider
      value={{
        user,
        notes: filteredNotes,
        isFetchingUser,
        searchQuery,
        viewMode,
        sortOrder,
        selectedNoteId,
        transcript, // Provide transcript
        setSearchQuery,
        setViewMode,
        setSortOrder,
        setSelectedNoteId,
        setTranscript, // Provide setter
        handleLogout,
        fetchNotes,
        deleteNote,
        renameNote,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};

export const useNoteContext = () => {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error("useNoteContext must be used within a NoteProvider");
  }
  return context;
};