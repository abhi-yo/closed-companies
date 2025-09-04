import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    unsubscribeToken: {
      type: String,
      required: true,
    },
    unsubscribedAt: {
      type: Date,
      default: null,
    },
    sourceIp: {
      type: String,
      default: null,
    },
    // Additional fields for better tracking
    bounced: {
      type: Boolean,
      default: false,
    },
    bouncedAt: {
      type: Date,
      default: null,
    },
    complained: {
      type: Boolean,
      default: false,
    },
    complainedAt: {
      type: Date,
      default: null,
    },
    emailsSent: {
      type: Number,
      default: 0,
    },
    lastEmailSent: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for better query performance
subscriberSchema.index({ email: 1 });
subscriberSchema.index({ verificationToken: 1 });
subscriberSchema.index({ unsubscribeToken: 1 });
subscriberSchema.index({ unsubscribedAt: 1, verified: 1 });
subscriberSchema.index({ bounced: 1, complained: 1 });
subscriberSchema.index({ verified: 1, unsubscribedAt: 1, bounced: 1, complained: 1 });

const NewsletterSubscriber = 
  mongoose.models.NewsletterSubscriber || 
  mongoose.model("NewsletterSubscriber", subscriberSchema);

export default NewsletterSubscriber;
