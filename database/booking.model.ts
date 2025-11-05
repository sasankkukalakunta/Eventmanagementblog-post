import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Simple email regex for basic validation */
const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Booking schema: references Event and stores requester email */
const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true, // index for faster lookups by event
    },
    email: { type: String, required: true, trim: true },
  },
  { timestamps: true, strict: true }
);

/**
/**
 * Pre-save:
 * - Ensure referenced Event exists before saving a booking.
 * - Validate email format.
 */
BookingSchema.pre<IBooking>("save", async function () {
  // Basic email format validation
  if (typeof this.email !== "string" || !EMAIL_REGEX.test(this.email)) {
    throw new Error("Invalid email");
  }

  // Verify referenced event exists using the mongoose model registry to avoid a hard import
  const EventModel =
    (mongoose.models.Event as mongoose.Model<any>) || mongoose.model("Event");
  const exists = await EventModel.exists({ _id: this.eventId });
  if (!exists) {
    throw new Error("Referenced event does not exist");
  }
});
/** Export model (avoid recompilation issues during HMR) */
export const Booking: Model<IBooking> =
  (mongoose.models.Booking as Model<IBooking>) ||
  mongoose.model<IBooking>("Booking", BookingSchema);