import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// TypeScript interface for the Booking document
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Booking schema definition
const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      validate: {
        validator: (v: string) => {
          // RFC 5322 compliant email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(v);
        },
        message: 'Please provide a valid email address',
      },
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Pre-save hook to verify that the referenced event exists
bookingSchema.pre('save', async function (this: IBooking) {
  // Only validate eventId if it's new or modified
  if (this.isModified('eventId')) {
    try {
      // Dynamically import Event model to avoid circular dependency issues
      const Event = mongoose.models.Event || (await import('./event.model')).default;
      
      // Check if the event exists in the database
      const eventExists = await Event.findById(this.eventId);
      
      if (!eventExists) {
        throw new Error('Referenced event does not exist');
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error('Event validation failed');
    }
  }
});

// Create index on eventId for efficient queries
bookingSchema.index({ eventId: 1 });

// Export the Booking model, reusing existing model if already compiled
const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;
