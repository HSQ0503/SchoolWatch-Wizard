"use client";

import { useState } from "react";
import type { Announcement, AnnouncementInput, AnnouncementType } from "@/lib/announcements";
import { ANNOUNCEMENT_TYPE_LABELS, VALID_TYPES } from "@/lib/announcements";

type Props = {
  announcement?: Announcement;
  onSave: (data: AnnouncementInput) => void | Promise<void>;
  onCancel: () => void;
};

const INPUT_CLASS =
  "w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors duration-150";
const LABEL_CLASS = "block text-sm font-medium text-gray-300 mb-1.5";

export default function AnnouncementForm({ announcement, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(announcement?.title ?? "");
  const [body, setBody] = useState(announcement?.body ?? "");
  const [type, setType] = useState<AnnouncementType>(announcement?.type ?? "info");
  const [pinned, setPinned] = useState(announcement?.pinned ?? false);
  const [expiresAt, setExpiresAt] = useState(announcement?.expiresAt ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    try {
      await onSave({ title: title.trim(), body: body.trim(), type, pinned, expiresAt });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={LABEL_CLASS}>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={120}
          className={INPUT_CLASS}
        />
      </div>
      <div>
        <label className={LABEL_CLASS}>Body</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={3}
          maxLength={500}
          className={INPUT_CLASS}
        />
      </div>
      <div>
        <label className={LABEL_CLASS}>Type</label>
        <div className="flex gap-2">
          {VALID_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-150 ${
                type === t
                  ? "bg-white text-black"
                  : "border border-white/20 text-gray-300 hover:border-white/40"
              }`}
            >
              {ANNOUNCEMENT_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <input
          id="pinned"
          type="checkbox"
          checked={pinned}
          onChange={(e) => setPinned(e.target.checked)}
          className="h-4 w-4 rounded border-white/20 bg-white/10"
        />
        <label htmlFor="pinned" className="text-sm text-gray-300">
          Pin to top
        </label>
      </div>
      <div>
        <label className={LABEL_CLASS}>
          Expires on <span className="text-gray-500">(optional)</span>
        </label>
        <input
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className={INPUT_CLASS}
        />
      </div>
      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-gray-100 disabled:opacity-50"
        >
          {announcement ? "Save changes" : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/20 px-4 py-2 text-sm text-gray-300 transition-colors hover:text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
