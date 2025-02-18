"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Star, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NoteCard from "@/components/NoteCard";
import CreateNote from "@/components/CreateNote";
import Loader from "@/components/Loader";
import SearchBar from "@/components/SearchBar";
import SortButton from "@/components/Sort";

interface Note {
  _id: string;
  title: string;
  noteContent: string;
  noteIsRecorded: boolean;
  images: string[];
  creationDate: string;
  isFavorite: boolean;
}

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [isFetchingUser, setIsFetchingUser] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"all" | "favorites">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest"); // Sorting order state
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

  useEffect(() => {
    if (user) {
      const endpoint =
        viewMode === "all"
          ? `http://localhost:3000/api/notes?userId=${user._id}`
          : `http://localhost:3000/api/favorite?userId=${user._id}`;

      axios
        .get(endpoint)
        .then((response) => setNotes(response.data.notes))
        .catch((error) => console.error("Error fetching notes:", error));
    }
  }, [user, viewMode]);

  if (isFetchingUser) {
    return <Loader />;
  }

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

  // Filter and Sort Notes
  const filteredNotes = notes
    .filter((note) => {
      const query = searchQuery.toLowerCase();
      return (
        note.title.toLowerCase().includes(query) ||
        note.noteContent.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime();
      } else {
        return new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime();
      }
    });

  return (
    <div className="flex h-screen">
      {isFetchingUser && <Loader />}
      {/* Sidebar */}
      <SidebarProvider>
        <Sidebar>
          <div className="flex flex-col justify-between h-full p-4">
            <div>
              <div className="flex items-center mb-8">
                <Avatar className="bg-slate-900 border border-slate-300">
                  <AvatarImage alt="Avatar" src={user?.avatarUrl} />
                  <AvatarFallback>{user?.username[0]}</AvatarFallback>
                </Avatar>
                <span className="ml-2 font-semibold">{user?.username}</span>
              </div>
              <nav className="space-y-2">
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    viewMode === "all" ? "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300" : ""
                  }`}
                  onClick={() => setViewMode("all")}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Home
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    viewMode === "favorites" ? "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300" : ""
                  }`}
                  onClick={() => setViewMode("favorites")}
                >
                  <Star className="mr-2 h-4 w-4" />
                  Favorites
                </Button>
              </nav>
            </div>
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </div>
        </Sidebar>

        <div className="flex-1 flex flex-col p-4 mb-10">
          {/* Search and Sort */}
          <div className="flex items-center justify-between mb-4 gap-2">
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <SortButton sortOrder={sortOrder} setSortOrder={setSortOrder} />
          </div>

          {/* Notes Section */}
          <div className="flex flex-wrap gap-4">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note._id}
                id={note._id}
                title={note.title}
                isFavorite={note.isFavorite}
                noteIsRecorded={note.noteIsRecorded}
                images={note.images}
                content={note.noteContent}
                date={new Date(note.creationDate).toLocaleString()}
                duration="N/A"
                onDelete={(id) => setNotes(notes.filter((note) => note._id !== id))}
                onRename={(id, newTitle) =>
                  setNotes(notes.map((note) => (note._id === id ? { ...note, title: newTitle } : note)))
                }
              />
            ))}
          </div>
        </div>
        <CreateNote />
      </SidebarProvider>
    </div>
  );
}