import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // ISO string
  time: string; // normalized "HH:MM"
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/** Helper: create a URL-friendly slug from a title */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Helper: normalize time input to 24-hour "HH:MM" format */
function normalizeTime(input: string): string {
  const trimmed = (input || "").trim();
  const m = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?$/);
  if (!m) throw new Error("Invalid time format");
  let hours = parseInt(m[1], 10);
  const minutes = m[2] ? parseInt(m[2], 10) : 0;
  const ampm = m[3];
  if (ampm) {
    const isPM = /pm/i.test(ampm);
    if (hours === 12) hours = isPM ? 12 : 0;
    else if (isPM) hours += 12;
  }
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error("Invalid time value");
  }
  return String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");
}

/** Schema definition with required validations and timestamps */
const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    overview: { type: String, required: true },
    image: { type: String, required: true },
    venue: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: String, required: true }, // stored as ISO string
    time: { type: String, required: true }, // stored as "HH:MM"
    mode: { type: String, required: true },
    audience: { type: String, required: true },
    agenda: { type: [String], required: true },
    organizer: { type: String, required: true },
    tags: { type: [String], required: true },
  },
  { timestamps: true, strict: true }
);

/** Unique index on slug for fast lookup and uniqueness enforcement */
EventSchema.index({ slug: 1 }, { unique: true });

/**
 * Pre-save:
 * - Generate/refresh slug only when title changes.
 * - Normalize date to ISO format and time to "HH:MM".
 * - Validate presence of required string/array fields and non-empty values.
 */
EventSchema.pre<IEvent>("save", async function () {
  // Validate required string fields are non-empty
  const requiredStrings: (keyof IEvent)[] = [
    "title",
    "description",
    "overview",
    "image",
    "venue",
    "location",
    "date",
    "time",
    "mode",
    "audience",
    "organizer",
  ];
  for (const key of requiredStrings) {
    const val = this.get(key) as unknown;
    if (typeof val !== "string" || val.trim().length === 0) {
      throw new Error(`${String(key)} is required and must be non-empty`);
    }
  }

  // Validate required arrays
  if (!Array.isArray(this.agenda) || this.agenda.length === 0) {
    throw new Error("agenda is required and must be a non-empty array");
  }
  if (!Array.isArray(this.tags) || this.tags.length === 0) {
    throw new Error("tags is required and must be a non-empty array");
  }

  // Slug generation: only when title changes (or on new doc)
  if (this.isModified("title")) {
    this.slug = slugify(this.title);
  }

  // Normalize date to ISO string
  const parsedDate = new Date(this.date);
  if (isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date format");
  }
  this.date = parsedDate.toISOString();

  // Normalize time to HH:MM 24-hour
  this.time = normalizeTime(this.time);
});

/** Export model (avoid recompilation issues during HMR) */
export const Event: Model<IEvent> =
  (mongoose.models.Event as Model<IEvent>) ||
  mongoose.model<IEvent>("Event", EventSchema);