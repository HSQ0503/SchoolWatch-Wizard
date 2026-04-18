export type AnnouncementType = "info" | "warning" | "urgent";

export const VALID_TYPES: AnnouncementType[] = ["info", "warning", "urgent"];

export const MAX_ACTIVE = 4;

export const ANNOUNCEMENT_TYPE_LABELS: Record<AnnouncementType, string> = {
  info: "Info",
  warning: "Warning",
  urgent: "Urgent",
};

export type AnnouncementInput = {
  title: string;
  body: string;
  type: AnnouncementType;
  pinned: boolean;
  expiresAt: string; // "YYYY-MM-DD" or "" for none
};

export type Announcement = {
  id: string;
  schoolId: string;
  title: string;
  body: string;
  type: AnnouncementType;
  pinned: boolean;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};
