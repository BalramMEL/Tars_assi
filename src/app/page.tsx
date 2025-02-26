"use client";

import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Star, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CreateNote from "@/components/CreateNote";
import Loader from "@/components/Loader";
import SearchBar from "@/components/SearchBar";
import SortButton from "@/components/Sort";
import { NoteProvider, useNoteContext } from "@/context/NoteContext";
import NoteCard from "@/components/NoteCard";

function HomeContent() {
  const {
    user,
    notes,
    isFetchingUser,
    searchQuery,
    viewMode,
    sortOrder,
    setSearchQuery,
    setViewMode,
    setSortOrder,
    handleLogout,
  } = useNoteContext();

  if (isFetchingUser) {
    return <Loader />;
  }

  return (
    <div className="flex h-screen">
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
            {notes.map((note) => (
              <NoteCard key={note._id} {...note} date={new Date(note.creationDate).toLocaleString()} duration="N/A" />
            ))}
          </div>
        </div>
        <CreateNote />
      </SidebarProvider>
    </div>
  );
}

export default function Home() {
  return (
    <NoteProvider>
      <HomeContent />
      {/* <CreateNote /> */}
    </NoteProvider>
  );
}