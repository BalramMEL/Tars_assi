"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Trash, Edit, Play, ImagesIcon } from "lucide-react";
import toast from "react-hot-toast";
import NoteModal from "./NoteModal";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "./ui/dialog";
import { useNoteContext } from "@/context/NoteContext";

interface NoteCardProps {
  _id: string;
  title: string;
  noteContent: string;
  date: string;
  duration: string;
  noteIsRecorded?: boolean;
  isFavorite?: boolean;
  images?: string[];
}

export default function NoteCard({
  _id: id,
  title,
  noteContent: content,
  date,
  duration,
  noteIsRecorded,
  images,
  isFavorite,
}: NoteCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { deleteNote, renameNote, setSelectedNoteId } = useNoteContext();

  const handleCopy = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteNote(id);
    setShowConfirmModal(false);
    setIsDeleting(false);
  };

  return (
    <>
      <Card className="w-[350px] h-[350px] flex flex-col cursor-pointer" onClick={() => setSelectedNoteId(id)}>
        <CardContent className="p-4 flex flex-col flex-grow">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{date}</span>
            {noteIsRecorded && (
              <div className="bg-gray-200 px-2 py-1 rounded-2xl flex items-center space-x-1">
                <Play fill="currentColor" className="w-3 h-3 text-gray-600" />
                <span className="text-xs text-gray-500">3:45</span>
              </div>
            )}
          </div>

          <h3 className="font-semibold mt-3">{title}</h3>
          <div className="flex flex-col mt-2">
            <p className="mt-2 text-gray-700 flex-grow">{content}</p>
            {images && images.length > 0 && (
              <div className="flex items-center mt-2 space-x-1 px-2 py-1 bg-gray-100 rounded-2xl w-fit">
                <ImagesIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">{images.length} Image</span>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-auto">
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              <Copy className="w-4 h-4 mr-1" />
            </Button>
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfirmModal(true);
                }}
                disabled={isDeleting}
              >
                {isDeleting ? "..." : <Trash className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <NoteModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        id={id}
        noteIsRecorded={noteIsRecorded}
        images={images}
        isFavorite={isFavorite}
        title={title}
        content={content}
        duration={duration}
        onRename={renameNote}
      />

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>This action cannot be undone. Your note will be permanently deleted.</DialogDescription>
          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}