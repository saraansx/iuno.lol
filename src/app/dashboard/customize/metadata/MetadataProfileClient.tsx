"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateMetadataProfile } from "@/actions/profile";
import { toast } from "@/components/ui/toast";
import SaveBar from "@/components/dashboard/SaveBar";
import EmbedContentSection from "@/components/dashboard/customize/metadata/EmbedContentSection";
import EmbedPreviewSection from "@/components/dashboard/customize/metadata/EmbedPreviewSection";
import { type FullUser } from "@/lib/features/users/db";
import { normalizeEmbedColor } from "@/lib/og";

export default function MetadataProfileClient({
  user,
  ogImagePath,
}: {
  user: FullUser | null;
  ogImagePath: string | null;
}) {
  const router = useRouter();

  const initialTitle = user?.embedTitle ?? "";
  const initialDescription = user?.embedDescription ?? "";
  const initialColor = normalizeEmbedColor(user?.embedColor);

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [color, setColor] = useState(initialColor);

  const hasChanges =
    title !== initialTitle || description !== initialDescription || color !== initialColor;
  const username = user?.username ?? "";

  return (
    <div className="w-full pb-10 grid grid-cols-1 lg:grid-cols-[1fr_600px] gap-6">
      <EmbedContentSection
        username={username}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        color={color}
        setColor={setColor}
      />

      <EmbedPreviewSection
        username={username}
        title={title}
        description={description}
        color={color}
        ogImagePath={ogImagePath}
      />

      <SaveBar
        show={hasChanges}
        onSave={async () => {
          try {
            await updateMetadataProfile({ embedTitle: title, embedDescription: description });
            toast.success("Profile Saved Sucessfully");
            router.refresh();
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save profile");
          }
        }}
        onRevert={() => {
          setTitle(initialTitle);
          setDescription(initialDescription);
          setColor(initialColor);
        }}
      />
    </div>
  );
}
