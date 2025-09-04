import mongoose from "mongoose";

export interface ICustomer {
  email: string;
  name?: string;
  subscriptionStatus: "active" | "inactive" | "cancelled" | "past_due";
  subscriptionId?: string; // Stripe subscription ID
  customerId?: string; // Stripe customer ID
  subscribedAt: Date;
  subscriptionEndsAt?: Date;
  lastPaymentAt?: Date;
  plan: "monthly";
  unsubscribeToken: string;
  preferences: {
    industries?: string[];
    regions?: string[];
    fundingRange?: string;
  };
  lastDigestSentAt?: Date;
  sourceIp?: string;
}

const CustomerSchema = new mongoose.Schema<ICustomer>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },
    name: {
      type: String,
      trim: true,
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive", "cancelled", "past_due"],
      default: "inactive",
      required: true,
    },
    subscriptionId: {
      type: String,
      index: true,
    },
    customerId: {
      type: String,
      index: true,
    },
    subscribedAt: {
      type: Date,
      default: () => new Date(),
      required: true,
    },
    subscriptionEndsAt: {
      type: Date,
    },
    lastPaymentAt: {
      type: Date,
    },
    plan: {
      type: String,
      enum: ["monthly"],
      default: "monthly",
      required: true,
    },
    unsubscribeToken: {
      type: String,
      required: true,
      index: true,
    },
    preferences: {
      industries: [String],
      regions: [String],
      fundingRange: String,
    },
    lastDigestSentAt: {
      type: Date,
    },
    sourceIp: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

CustomerSchema.index({ email: 1 });
CustomerSchema.index({ subscriptionStatus: 1 });
CustomerSchema.index({ subscriptionId: 1 });

export default mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);
