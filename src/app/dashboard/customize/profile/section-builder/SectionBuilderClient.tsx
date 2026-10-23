"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Reorder } from "framer-motion";
import { type AboutSectionData } from "./AboutSectionRow";
import CustomSectionRow from "./CustomSectionRow";
import CreateSectionModal from "./CreateSectionModal";
import SaveBar from "@/components/dashboard/SaveBar";
import DashboardProfilePreview from "@/components/dashboard/DashboardProfilePreview";
import { updateLayoutProfile } from "@/actions/profile";
import { toast } from "@/components/ui/toast";
import { type FullUser } from "@/lib/features/users/db";
import type { LinksSectionData } from "./LinksSectionRow";
import type { ProfileSection } from "@/lib/profile-sections";
interface SectionBuilderClientProps {
  user: FullUser | null;
  backgrounds?: string[];
  initialSectioned: boolean;
  initialAbout: AboutSectionData;
  initialLinks: Omit<LinksSectionData, "bigCount"> & { bigCount: number };
  initialSections: ProfileSection[];
}

export default function SectionBuilderClient({
  user,
  backgrounds,
  initialSectioned,
  initialAbout,
  initialLinks,
  initialSections,
}: SectionBuilderClientProps) {
  const router = useRouter();
  const [sectioned, setSectioned] = useState(initialSectioned);
  const [sections, setSections] = useState<ProfileSection[]>(initialSections);
  const [createOpen, setCreateOpen] = useState(false);

  const hasChanges =
    sectioned !== initialSectioned ||
    JSON.stringify(sections) !== JSON.stringify(initialSections);

  const patchSection = (id: string, patch: Partial<ProfileSection>) =>
    setSections((prev) => prev.map((section) => (section.id === id ? { ...section, ...patch } : section)));

  const removeSection = (id: string) =>
    setSections((prev) => prev.filter((section) => section.id !== id));

  const usedCategories = (excludeId?: string) => {
    const map: Record<string, string> = {};
    for (const section of sections) {
      if (section.id === excludeId) continue;
      for (const category of section.categories) {
        if (!map[category]) map[category] = section.title || "Untitled section";
      }
    }
    return map;
  };

  const handleSave = async () => {
    try {
      await updateLayoutProfile({
        profileStructure: sectioned ? "sectioned" : "standard",
        profileSections: sections,
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
    setSections(initialSections);
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

      <div className="flex items-center gap-3 pt-1">
        <span className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-white/35 shrink-0">
          Profile sections ({sections.length})
        </span>
        <span className="h-px flex-1 bg-white/[0.07]" />

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 px-3.5 py-2 text-[13px] font-normal text-white transition-all cursor-pointer shrink-0 whitespace-nowrap"
        >
          <Plus size={15} strokeWidth={2.5} />
          Create section
        </button>
      </div>

      {sections.length === 0 ? (
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="flex flex-col items-center justify-center gap-1 rounded-[16px] border border-dashed border-white/10 bg-white/[0.015] hover:bg-white/[0.03] px-4 py-7 transition-colors cursor-pointer"
        >
          <span className="text-[13px] text-white/60">No sections yet</span>
          <span className="text-[11.5px] text-white/30">
            Create your first section — About, Socials, Links, Music or anything else.
          </span>
        </button>
      ) : (
        <Reorder.Group
          axis="y"
          values={sections}
          onReorder={setSections}
          as="div"
          className="flex flex-col gap-3"
        >
          {sections.map((section) => (
            <CustomSectionRow
              key={section.id}
              data={section}
              onChange={(patch) => patchSection(section.id, patch)}
              onDelete={() => removeSection(section.id)}
              usedCategories={usedCategories(section.id)}
            />
          ))}
        </Reorder.Group>
      )}

      <DashboardProfilePreview
        user={user}
        backgrounds={backgrounds}
        overrides={{
          profileStructure: sectioned ? "sectioned" : "standard",
          aboutSectionEnabled: initialAbout.hidden === false,
          aboutSectionTitle: initialAbout.title,
          aboutSectionDescription: initialAbout.description,
          linksSectionEnabled: !initialLinks.hidden,
          linksSectionTitle: initialLinks.title,
          linksSectionDescription: initialLinks.description,
          linksSectionPosition: initialLinks.aboveAbout ? "above" : "below",
          profileSections: sections,
        }}
      />

      <SaveBar show={hasChanges} onSave={handleSave} onRevert={handleRevert} />

      <CreateSectionModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        usedCategories={usedCategories()}
        onCreate={(section) => setSections((prev) => [...prev, section])}
      />
    </>
  );
}
