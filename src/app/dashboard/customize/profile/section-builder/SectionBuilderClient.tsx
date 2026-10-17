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
  initialSectioned: boolean;
  initialAbout: AboutSectionData;
  initialLinks: Omit<LinksSectionData, "bigCount"> & { bigCount: number };
}

export default function SectionBuilderClient({ user, backgrounds, initialSectioned, initialAbout, initialLinks }: SectionBuilderClientProps) {
  const router = useRouter();
  const [sectioned, setSectioned] = useState(initialSectioned);
  const [about, setAbout] = useState<AboutSectionData>(initialAbout);
  const [links, setLinks] = useState<LinksSectionData>(initialLinks);
  const [dragging, setDragging] = useState<"about" | "links" | null>(null);
  const [dropTarget, setDropTarget] = useState<"about" | "links" | null>(null);

  const hasChanges =
    sectioned !== initialSectioned ||
    JSON.stringify({ about, links }) !== JSON.stringify({ about: initialAbout, links: initialLinks });

  const patchAbout = (patch: Partial<AboutSectionData>) =>
    setAbout((prev) => ({ ...prev, ...patch }));
  const patchLinks = (patch: Partial<LinksSectionData>) =>
    setLinks((prev) => ({ ...prev, ...patch }));

  const toggleOrder = () => patchLinks({ aboveAbout: !links.aboveAbout });

  const readSectionAt = (x: number, y: number): "about" | "links" | null => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const kind = el?.closest?.("[data-section]")?.getAttribute("data-section");
    return kind === "about" || kind === "links" ? kind : null;
  };

  const handlePointerDown =
    (kind: "about" | "links") => (e: React.PointerEvent) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setDragging(kind);
      setDropTarget(null);
    };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDropTarget(readSectionAt(e.clientX, e.clientY));
  };

  const handlePointerUp =
    (kind: "about" | "links") => (e: React.PointerEvent) => {
      const target = readSectionAt(e.clientX, e.clientY);
      if (target && target !== kind) toggleOrder();
      setDragging(null);
      setDropTarget(null);
    };

  const handlePointerCancel = () => {
    setDragging(null);
    setDropTarget(null);
  };

  const handleHandleKeyDown = (e: React.KeyboardEvent) => {
    if (["ArrowUp", "ArrowDown", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      toggleOrder();
    }
  };

  const above = links.aboveAbout;

  const aboutRow = (
    <AboutSectionRow
      data={about}
      onChange={patchAbout}
      dragHandleProps={{
        onPointerDown: handlePointerDown("about"),
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp("about"),
        onPointerCancel: handlePointerCancel,
        onKeyDown: handleHandleKeyDown,
      }}
      dropHighlight={dragging === "links" && dropTarget === "about"}
      isDragging={dragging === "about"}
    />
  );

  const linksRow = (
    <LinksSectionRow
      data={links}
      onChange={patchLinks}
      dragHandleProps={{
        onPointerDown: handlePointerDown("links"),
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp("links"),
        onPointerCancel: handlePointerCancel,
        onKeyDown: handleHandleKeyDown,
      }}
      dropHighlight={dragging === "about" && dropTarget === "links"}
      isDragging={dragging === "links"}
    />
  );

  const handleSave = async () => {
    try {
      await updateLayoutProfile({
        profileStructure: sectioned ? "sectioned" : "standard",
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
    setSectioned(initialSectioned);
    setAbout(initialAbout);
    setLinks(initialLinks);
  };

  return (
    <>
      <div className="bg-[#0c0c0c] border border-white/5 rounded-[16px] px-5 py-3.5 flex items-center gap-4 shadow-sm">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5b6cf5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M12 2v20" />
            <path d="m8 6 4-4 4 4" />
            <path d="m8 18 4 4 4-4" />
          </svg>
          <div className="flex flex-col min-w-0">
            <h2 className="text-white font-normal text-[13.5px] tracking-tight leading-tight">Sectioned scroll</h2>
            <p className="text-[11.5px] text-white/40 leading-tight mt-0.5 truncate">
              {sectioned
                ? "Profile splits into screens you scroll through."
                : "Profile shows as one normal page. Sections still apply."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSectioned((v) => !v)}
          aria-pressed={sectioned}
          aria-label="Sectioned scroll"
          className={`w-9 h-[22px] rounded-full relative flex items-center transition-colors shrink-0 cursor-pointer focus:outline-none ${
            sectioned ? "bg-[#5b6cf5]" : "bg-white/10"
          }`}
        >
          <div className={`w-3.5 h-3.5 rounded-full absolute shadow-sm transition-all bg-white ${sectioned ? "right-[4px]" : "left-[4px]"}`} />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {above ? linksRow : aboutRow}
        {above ? aboutRow : linksRow}
      </div>

      <DashboardProfilePreview
        user={user}
        backgrounds={backgrounds}
        overrides={{
          profileStructure: sectioned ? "sectioned" : "standard",
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
