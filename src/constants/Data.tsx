import { Layers3Icon, Notebook, NotebookTabsIcon, SpeakerIcon } from "lucide-react";

export const DataRow = () => {
    return [
        {
            id: 1,
            title: "Notes",
            icon: <NotebookTabsIcon />
        },
        {
            id: 2,
            title: "Transcripts",
            icon: <Notebook />
        },
        {
            id: 3,
            title: "Create",
            icon: <Layers3Icon />
        },
        {
            id: 4,
            title: "Speaker Transcripts",
            icon: <SpeakerIcon />
        },
    ];
}