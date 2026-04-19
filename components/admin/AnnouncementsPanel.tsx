"use client";

import { useCallback, useEffect, useState } from "react";
import AnnouncementForm from "@/components/admin/AnnouncementForm";
import type { Announcement, AnnouncementInput } from "@/lib/announcements";
import { ANNOUNCEMENT_TYPE_LABELS, MAX_ACTIVE } from "@/lib/announcements";

type Props = {
  schoolId: string;
};

const TYPE_BADGE: Record<string, string> = {
  info: "bg-white/10 text-gray-300",
  warning: "bg-amber-500/20 text-amber-300",
  urgent: "bg-red-500/20 text-red-300",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AnnouncementsPanel({ schoolId }: Props) {
  const [rows, setRows] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/announcements?schoolId=${encodeURIComponent(schoolId)}`);
      if (res.ok) {
        setRows(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const activeCount = rows.filter((r) => r.active).length;
  const atLimit = activeCount >= MAX_ACTIVE;

  async function handleAdd(data: AnnouncementInput) {
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, schoolId }),
    });
    if (res.ok) {
      setShowAdd(false);
      fetchRows();
    }
  }

  async function handleEdit(data: AnnouncementInput) {
    if (!editingId) return;
    const res = await fetch(`/api/announcements/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setEditingId(null);
      fetchRows();
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDeleteId(null);
      fetchRows();
    }
  }

  async function handleToggleActive(id: string, currentActive: boolean) {
    if (!currentActive && atLimit) return;
    await fetch(`/api/announcements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !currentActive }),
    });
    fetchRows();
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Announcements</h2>
          <p className="text-sm text-gray-400">
            {activeCount}/{MAX_ACTIVE} active · {rows.length} total
          </p>
        </div>
        <button
          onClick={() => {
            setShowAdd(true);
            setEditingId(null);
          }}
          disabled={atLimit}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            atLimit
              ? "cursor-not-allowed bg-white/10 text-gray-500"
              : "bg-white text-black hover:bg-gray-100"
          }`}
        >
          + Add Announcement
        </button>
      </div>

      {showAdd && (
        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-5">
          <h3 className="mb-4 text-base font-semibold text-white">New Announcement</h3>
          <AnnouncementForm onSave={handleAdd} onCancel={() => setShowAdd(false)} />
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[88px] animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/20 py-12 text-center">
          <p className="text-sm font-medium text-gray-400">No announcements yet</p>
          <p className="mt-1 text-xs text-gray-500">Click &quot;Add Announcement&quot; to create one</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((a) => (
            <div
              key={a.id}
              className={`group rounded-xl border border-white/10 bg-white/5 p-4 transition-colors ${
                !a.active ? "opacity-50" : ""
              }`}
            >
              {editingId === a.id ? (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-white">Edit Announcement</h3>
                  <AnnouncementForm
                    announcement={a}
                    onSave={handleEdit}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-white">{a.title}</p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${TYPE_BADGE[a.type] ?? TYPE_BADGE.info}`}
                      >
                        {ANNOUNCEMENT_TYPE_LABELS[a.type as keyof typeof ANNOUNCEMENT_TYPE_LABELS] ?? a.type}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-sm text-gray-400">{a.body}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {a.pinned && (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-gray-300">
                          Pinned
                        </span>
                      )}
                      {!a.active && (
                        <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-300">
                          Inactive
                        </span>
                      )}
                      {a.expiresAt && (
                        <span className="text-[11px] text-gray-400">Expires {formatDate(a.expiresAt)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {deleteId === a.id ? (
                      <>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-gray-300 hover:text-white"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleToggleActive(a.id, a.active)}
                          title={a.active ? "Deactivate" : "Activate"}
                          className="rounded-lg px-2.5 py-1.5 text-sm text-gray-400 opacity-0 transition-all hover:bg-white/10 hover:text-white group-hover:opacity-100"
                        >
                          {a.active ? "Hide" : "Show"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(a.id);
                            setShowAdd(false);
                          }}
                          className="rounded-lg px-2.5 py-1.5 text-sm text-gray-400 opacity-0 transition-all hover:bg-white/10 hover:text-white group-hover:opacity-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(a.id)}
                          className="rounded-lg px-2.5 py-1.5 text-sm text-gray-400 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-300 group-hover:opacity-100"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
