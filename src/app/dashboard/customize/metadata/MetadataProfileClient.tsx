"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateMetadataProfile } from "@/actions/profile";
import { toast } from "@/components/ui/toast";
import SaveBar from "@/components/dashboard/SaveBar";
import FaviconUpload from "@/components/dashboard/uploads/FaviconUpload";
import CursorUpload from "@/components/dashboard/uploads/CursorUpload";
import EmbedImageUpload from "@/components/dashboard/uploads/EmbedImageUpload";
import EmbedContentSection from "@/components/dashboard/customize/metadata/EmbedContentSection";
import EmbedPreviewSection from "@/components/dashboard/customize/metadata/EmbedPreviewSection";
import BrowserTabSection from "@/components/dashboard/customize/metadata/BrowserTabSection";
import { type FullUser } from "@/lib/features/users/db";
import { normalizeEmbedColor } from "@/lib/og";

async function uploadAsset(file: File, type: "favicon" | "cursor" | "embed"): Promise<string> {
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
  const initialEmbedBackground = user?.embedBackgroundUrl ?? "";
  const initialEmbedIcon = user?.embedIconUrl ?? "";
  const initialFavicon = user?.faviconUrl ?? "";
  const initialCursor = user?.cursorUrl ?? "";
  const initialTabTitle = user?.tabTitle ?? "";
  const initialTabTitleAnimated = user?.tabTitleAnimated ?? false;

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [color, setColor] = useState(initialColor);
  const [embedBackgroundUrl, setEmbedBackgroundUrl] = useState(initialEmbedBackground);
  const [embedIconUrl, setEmbedIconUrl] = useState(initialEmbedIcon);
  const [faviconUrl, setFaviconUrl] = useState(initialFavicon);
  const [cursorUrl, setCursorUrl] = useState(initialCursor);
  const [tabTitle, setTabTitle] = useState(initialTabTitle);
  const [tabTitleAnimated, setTabTitleAnimated] = useState(initialTabTitleAnimated);

  const [pendingFavicon, setPendingFavicon] = useState<File | null>(null);
  const [pendingCursor, setPendingCursor] = useState<File | null>(null);
  const [pendingEmbedBackground, setPendingEmbedBackground] = useState<File | null>(null);
  const [pendingEmbedIcon, setPendingEmbedIcon] = useState<File | null>(null);

  const [faviconModalOpen, setFaviconModalOpen] = useState(false);
  const [cursorModalOpen, setCursorModalOpen] = useState(false);
  const [embedBackgroundModalOpen, setEmbedBackgroundModalOpen] = useState(false);
  const [embedIconModalOpen, setEmbedIconModalOpen] = useState(false);

  const hasChanges =
    title !== initialTitle ||
    description !== initialDescription ||
    color !== initialColor ||
    embedBackgroundUrl !== initialEmbedBackground ||
    embedIconUrl !== initialEmbedIcon ||
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
          embedBackgroundUrl={embedBackgroundUrl}
          setEmbedBackgroundModalOpen={setEmbedBackgroundModalOpen}
          clearEmbedBackground={() => {
            setEmbedBackgroundUrl("");
            setPendingEmbedBackground(null);
          }}
          embedIconUrl={embedIconUrl}
          setEmbedIconModalOpen={setEmbedIconModalOpen}
          clearEmbedIcon={() => {
            setEmbedIconUrl("");
            setPendingEmbedIcon(null);
          }}
        />

        <EmbedPreviewSection
          username={username}
          displayName={user?.displayName ?? null}
          title={title}
          description={description}
          color={color}
          embedBackgroundUrl={embedBackgroundUrl}
          embedIconUrl={embedIconUrl}
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

      <FaviconUpload
        open={faviconModalOpen}
        onClose={() => setFaviconModalOpen(false)}
        onApply={(url, rawFile) => {
          setFaviconUrl(url);
          setPendingFavicon(rawFile ?? null);
        }}
      />

      <CursorUpload
        open={cursorModalOpen}
        onClose={() => setCursorModalOpen(false)}
        onApply={(url, rawFile) => {
          setCursorUrl(url);
          setPendingCursor(rawFile ?? null);
        }}
      />

      <EmbedImageUpload
        variant="background"
        open={embedBackgroundModalOpen}
        onClose={() => setEmbedBackgroundModalOpen(false)}
        onApply={(url, rawFile) => {
          setEmbedBackgroundUrl(url);
          setPendingEmbedBackground(rawFile ?? null);
        }}
      />

      <EmbedImageUpload
        variant="icon"
        open={embedIconModalOpen}
        onClose={() => setEmbedIconModalOpen(false)}
        onApply={(url, rawFile) => {
          setEmbedIconUrl(url);
          setPendingEmbedIcon(rawFile ?? null);
        }}
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
            const embedBackground = pendingEmbedBackground
              ? await uploadAsset(pendingEmbedBackground, "embed")
              : embedBackgroundUrl;
            const embedIcon = pendingEmbedIcon
              ? await uploadAsset(pendingEmbedIcon, "embed")
              : embedIconUrl;

            setFaviconUrl(favicon);
            setCursorUrl(cursor);
            setEmbedBackgroundUrl(embedBackground);
            setEmbedIconUrl(embedIcon);

            await updateMetadataProfile({
              embedTitle: title,
              embedDescription: description,
              embedColor: color,
              embedBackgroundUrl: embedBackground || null,
              embedIconUrl: embedIcon || null,
              faviconUrl: favicon || null,
              cursorUrl: cursor || null,
              tabTitle,
              tabTitleAnimated,
            });
            toast.success("Profile Saved Sucessfully");
            setPendingFavicon(null);
            setPendingCursor(null);
            setPendingEmbedBackground(null);
            setPendingEmbedIcon(null);
            router.refresh();
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save profile");
          }
        }}
        onRevert={() => {
          setTitle(initialTitle);
          setDescription(initialDescription);
          setColor(initialColor);
          setEmbedBackgroundUrl(initialEmbedBackground);
          setEmbedIconUrl(initialEmbedIcon);
          setFaviconUrl(initialFavicon);
          setCursorUrl(initialCursor);
          setTabTitle(initialTabTitle);
          setTabTitleAnimated(initialTabTitleAnimated);
          setPendingFavicon(null);
          setPendingCursor(null);
          setPendingEmbedBackground(null);
          setPendingEmbedIcon(null);
        }}
      />
    </>
  );
}
