"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AboutSectionRow from "./AboutSectionRow";
import LinksSectionRow from "./LinksSectionRow";
import { updateLayoutProfile } from "@/actions/profile";
import { toast } from "@/components/ui/toast";

interface SectionRowsClientProps {
  about: { hidden: boolean; title: string; description: string };
  links: {
    hidden: boolean;
    title: string;
    description: string;
    bigCount: number;
    aboveAbout: boolean;
  };
}

export default function SectionRowsClient({ about, links }: SectionRowsClientProps) {
  const router = useRouter();
  const [above, setAbove] = useState(links.aboveAbout);
  const [dragging, setDragging] = useState<"about" | "links" | null>(null);
  const [dropTarget, setDropTarget] = useState<"about" | "links" | null>(null);
  const [pending, startTransition] = useTransition();

  const persist = (position: "above" | "below") => {
    if (pending) return;
    setAbove(position === "above");
    startTransition(async () => {
      try {
        await updateLayoutProfile({ linksSectionPosition: position });
        router.refresh();
      } catch (error) {
        setAbove(position !== "above");
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Failed to reorder sections");
      }
    });
  };

  const dragStart =
    (kind: "about" | "links") => (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/section", kind);
      setDragging(kind);
    };

  const dragEnd = () => {
    setDragging(null);
    setDropTarget(null);
  };

  const dragOver =
    (target: "about" | "links") => (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDropTarget(target);
    };

  const dropOn = (target: "about" | "links") => (e: React.DragEvent) => {
    e.preventDefault();
    const kind = e.dataTransfer.getData("text/section");
    if (target === "about" && kind === "links") persist("above");
    if (target === "links" && kind === "about") persist("below");
    setDragging(null);
    setDropTarget(null);
  };

  const aboutRow = (
    <AboutSectionRow
      hidden={about.hidden}
      title={about.title}
      description={about.description}
      dragHandleProps={{ onDragStart: dragStart("about"), onDragEnd: dragEnd }}
      onDragOverRow={dragOver("about")}
      onDropRow={dropOn("about")}
      dropHighlight={dragging === "links" && dropTarget === "about"}
    />
  );

  const linksRow = (
    <LinksSectionRow
      hidden={links.hidden}
      title={links.title}
      description={links.description}
      bigCount={links.bigCount}
      dragHandleProps={{ onDragStart: dragStart("links"), onDragEnd: dragEnd }}
      onDragOverRow={dragOver("links")}
      onDropRow={dropOn("links")}
      dropHighlight={dragging === "about" && dropTarget === "links"}
    />
  );

  return (
    <div className="flex flex-col gap-3">
      {above ? linksRow : aboutRow}
      {above ? aboutRow : linksRow}
    </div>
  );
}
