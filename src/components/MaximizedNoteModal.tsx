import { useState, useRef } from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Bold, Italic, Underline } from "lucide-react";

interface MaximizedNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const MaximizedNoteModal = ({ isOpen, onClose, content, onChange }: MaximizedNoteModalProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [currentContent, setCurrentContent] = useState(content);

  const handleTextFormat = (command: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, undefined);
    }
  };

 const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
  const selection = window.getSelection();
  if (!selection) return;
  const range = selection.getRangeAt(0);
  const startOffset = range.startOffset;

  const newContent = (e.target as HTMLDivElement).innerHTML;
  setCurrentContent(newContent);
  const customEvent = {
    target: {
      name: "noteContent",
      value: newContent
    }
  } as unknown as React.ChangeEvent<HTMLTextAreaElement>;
  onChange(customEvent);

  // Restore Cursor Position
  setTimeout(() => {
    const newRange = document.createRange();
    const newSelection = window.getSelection();
    if (editorRef.current && editorRef.current.firstChild) {
      newRange.setStart(editorRef.current.firstChild as Text, Math.min(startOffset, (editorRef.current.firstChild as Text).length));
      newRange.collapse(true);
      if (newSelection) {
        newSelection.removeAllRanges();
        newSelection.addRange(newRange);
      }
    }
  }, 0);
};


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        {/* Header with title and close button */}
        <div className="flex items-center justify-between w-full">
          <DialogTitle>Transcript</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-7 w-7" />
            </Button>
          </DialogClose>
        </div>

        {/* Wrapper to position the textarea and toolbar together */}
        <div className="relative">
          {/* Contenteditable div instead of textarea for rich text */}
          <div
            ref={editorRef}
            className="w-full h-96 p-2 rounded-md border border-gray-300 overflow-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
            contentEditable={true}
            dangerouslySetInnerHTML={{ __html: currentContent }}
            onInput={handleContentChange}
          />

          {/* Absolutely positioned toolbar at bottom-middle of textarea */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center justify-center space-x-2 p-1 border border-gray-200 bg-white rounded-lg shadow-md w-max">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleTextFormat('bold')}
              title="Bold (Ctrl+B)"
              className="w-10 h-10"
            >
              <Bold className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleTextFormat('italic')}
              title="Italic (Ctrl+I)"
              className="w-10 h-10"
            >
              <Italic className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleTextFormat('underline')}
              title="Underline (Ctrl+U)"
              className="w-10 h-10"
            >
              <Underline className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="flex justify-end mt-4 space-x-2">
          <Button variant="destructive" onClick={onClose}>Close</Button>
          <Button variant="outline" onClick={onClose}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};