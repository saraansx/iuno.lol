"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateMetadataProfile } from "@/actions/profile";
import { toast } from "@/components/ui/toast";
import SaveBar from "@/components/dashboard/SaveBar";
import BannerUploadModal from "@/components/dashboard/BannerUploadModal";
import EmbedContentSection from "@/components/dashboard/customize/metadata/EmbedContentSection";
import EmbedPreviewSection from "@/components/dashboard/customize/metadata/EmbedPreviewSection";
import BrowserTabSection from "@/components/dashboard/customize/metadata/BrowserTabSection";
import { type FullUser } from "@/lib/features/users/db";
import { normalizeEmbedColor } from "@/lib/og";

async function uploadAsset(file: File, type: "favicon" | "cursor"): Promise<string> {
  const formData = new FormData();
  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", file);
  formData.append("assetType", type);

  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || `Failed to upload ${type}`);
  }
  const data = await res.json();
  return data.url;
}

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
  const initialFavicon = user?.faviconUrl ?? "";
  const initialCursor = user?.cursorUrl ?? "";
  const initialTabTitle = user?.tabTitle ?? "";
  const initialTabTitleAnimated = user?.tabTitleAnimated ?? false;

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [color, setColor] = useState(initialColor);
  const [faviconUrl, setFaviconUrl] = useState(initialFavicon);
  const [cursorUrl, setCursorUrl] = useState(initialCursor);
  const [tabTitle, setTabTitle] = useState(initialTabTitle);
  const [tabTitleAnimated, setTabTitleAnimated] = useState(initialTabTitleAnimated);

  // Blob previews only become real URLs on save, so the raw files wait here.
  const [pendingFavicon, setPendingFavicon] = useState<File | null>(null);
  const [pendingCursor, setPendingCursor] = useState<File | null>(null);

  const [faviconModalOpen, setFaviconModalOpen] = useState(false);
  const [cursorModalOpen, setCursorModalOpen] = useState(false);

  const hasChanges =
    title !== initialTitle ||
    description !== initialDescription ||
    color !== initialColor ||
    faviconUrl !== initialFavicon ||
    cursorUrl !== initialCursor ||
    tabTitle !== initialTabTitle ||
    tabTitleAnimated !== initialTabTitleAnimated;

  const username = user?.username ?? "";

  return (
    <>
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

        <div className="lg:col-span-2">
          <BrowserTabSection
            username={username}
            faviconUrl={faviconUrl}
            cursorUrl={cursorUrl}
            tabTitle={tabTitle}
            setTabTitle={setTabTitle}
            tabTitleAnimated={tabTitleAnimated}
            setTabTitleAnimated={setTabTitleAnimated}
            setFaviconModalOpen={setFaviconModalOpen}
            setCursorModalOpen={setCursorModalOpen}
            clearFavicon={() => {
              setFaviconUrl("");
              setPendingFavicon(null);
            }}
            clearCursor={() => {
              setCursorUrl("");
              setPendingCursor(null);
            }}
          />
        </div>
      </div>

      <BannerUploadModal
        open={faviconModalOpen}
        onClose={() => setFaviconModalOpen(false)}
        onApply={(url, rawFile) => {
          setFaviconUrl(url);
          setPendingFavicon(rawFile ?? null);
        }}
        type="favicon"
      />

      <BannerUploadModal
        open={cursorModalOpen}
        onClose={() => setCursorModalOpen(false)}
        onApply={(url, rawFile) => {
          setCursorUrl(url);
          setPendingCursor(rawFile ?? null);
        }}
        type="cursor"
      />

      <SaveBar
        show={hasChanges}
        onSave={async () => {
          try {
            const favicon = pendingFavicon
              ? await uploadAsset(pendingFavicon, "favicon")
              : faviconUrl;
            const cursor = pendingCursor
              ? await uploadAsset(pendingCursor, "cursor")
              : cursorUrl;

            setFaviconUrl(favicon);
            setCursorUrl(cursor);

            await updateMetadataProfile({
              embedTitle: title,
              embedDescription: description,
              embedColor: color,
              faviconUrl: favicon || null,
              cursorUrl: cursor || null,
              tabTitle,
              tabTitleAnimated,
            });
            toast.success("Profile Saved Sucessfully");
            setPendingFavicon(null);
            setPendingCursor(null);
            router.refresh();
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save profile");
          }
        }}
        onRevert={() => {
          setTitle(initialTitle);
          setDescription(initialDescription);
          setColor(initialColor);
          setFaviconUrl(initialFavicon);
          setCursorUrl(initialCursor);
          setTabTitle(initialTabTitle);
          setTabTitleAnimated(initialTabTitleAnimated);
          setPendingFavicon(null);
          setPendingCursor(null);
        }}
      />
    </>
  );
}
