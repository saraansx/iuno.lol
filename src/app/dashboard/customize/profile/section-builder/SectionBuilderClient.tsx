"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AboutSectionRow, { type AboutSectionData } from "./AboutSectionRow";
import LinksSectionRow, { type LinksSectionData } from "./LinksSectionRow";
import SaveBar from "@/components/dashboard/SaveBar";
import DashboardProfilePreview from "@/components/dashboard/DashboardProfilePreview";
import { updateLayoutProfile } from "@/actions/profile";
import { toast } from "@/components/ui/toast";
import { type FullUser } from "@/lib/features/users/db";

interface SectionBuilderClientProps {
  user: FullUser | null;
  backgrounds?: string[];
  initialAbout: AboutSectionData;
  initialLinks: Omit<LinksSectionData, "bigCount"> & { bigCount: number };
}

export default function SectionBuilderClient({ user, backgrounds, initialAbout, initialLinks }: SectionBuilderClientProps) {
  const router = useRouter();
  const [about, setAbout] = useState<AboutSectionData>(initialAbout);
  const [links, setLinks] = useState<LinksSectionData>(initialLinks);
  const [dragging, setDragging] = useState<"about" | "links" | null>(null);
  const [dropTarget, setDropTarget] = useState<"about" | "links" | null>(null);

  const hasChanges =
    JSON.stringify({ about, links }) !== JSON.stringify({ about: initialAbout, links: initialLinks });

  const patchAbout = (patch: Partial<AboutSectionData>) =>
    setAbout((prev) => ({ ...prev, ...patch }));
  const patchLinks = (patch: Partial<LinksSectionData>) =>
    setLinks((prev) => ({ ...prev, ...patch }));

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
    if ((kind === "about" || kind === "links") && kind !== target) {
      patchLinks({ aboveAbout: !links.aboveAbout });
    }
    setDragging(null);
    setDropTarget(null);
  };

  const above = links.aboveAbout;

  const aboutRow = (
    <AboutSectionRow
      data={about}
      onChange={patchAbout}
      dragHandleProps={{ onDragStart: dragStart("about"), onDragEnd: dragEnd }}
      onDragOverRow={dragOver("about")}
      onDropRow={dropOn("about")}
      dropHighlight={dragging === "links" && dropTarget === "about"}
      isDragging={dragging === "about"}
    />
  );

  const linksRow = (
    <LinksSectionRow
      data={links}
      onChange={patchLinks}
      dragHandleProps={{ onDragStart: dragStart("links"), onDragEnd: dragEnd }}
      onDragOverRow={dragOver("links")}
      onDropRow={dropOn("links")}
      dropHighlight={dragging === "about" && dropTarget === "links"}
      isDragging={dragging === "links"}
    />
  );

  const handleSave = async () => {
    try {
      await updateLayoutProfile({
        aboutSectionEnabled: about.hidden === false,
        aboutSectionTitle: about.title,
        aboutSectionDescription: about.description,
        linksSectionEnabled: links.hidden === false,
        linksSectionTitle: links.title,
        linksSectionDescription: links.description,
        linksSectionPosition: links.aboveAbout ? "above" : "below",
      });
      toast.success("Profile Saved Sucessfully");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to save sections");
    }
  };

  const handleRevert = () => {
    setAbout(initialAbout);
    setLinks(initialLinks);
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        {above ? linksRow : aboutRow}
        {above ? aboutRow : linksRow}
      </div>

      <DashboardProfilePreview
        user={user}
        backgrounds={backgrounds}
        overrides={{
          aboutSectionEnabled: about.hidden === false,
          aboutSectionTitle: about.title,
          aboutSectionDescription: about.description,
          linksSectionEnabled: links.hidden === false,
          linksSectionTitle: links.title,
          linksSectionDescription: links.description,
          linksSectionPosition: links.aboveAbout ? "above" : "below",
        }}
      />

      <SaveBar show={hasChanges} onSave={handleSave} onRevert={handleRevert} />
    </>
  );
}
