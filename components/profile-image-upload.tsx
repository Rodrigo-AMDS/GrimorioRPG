"use client";

import { ChangeEvent, useState, useTransition } from "react";

export function ProfileImageUpload({ imageId, name, saveImage }: { imageId: string | null; name: string; saveImage: (data: FormData) => void | Promise<void> }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const upload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    const data = new FormData(); data.set("image", file);
    startTransition(async () => { await saveImage(data); });
  };
  return <div className="identity-totem">{preview || imageId ? <img src={preview || `/api/assets/${imageId}`} alt={`Retrato de ${name}`} /> : <span>✦</span>}<label className="totem-upload">{pending ? "SALVANDO..." : "IMPORTAR RETRATO"}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} disabled={pending} /></label></div>;
}
