import mongoose from "mongoose"

const TransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["credit_earned", "credit_spent", "subscription_payment", "course_purchase", "item_purchase"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    relatedItem: {
      itemType: {
        type: String,
        enum: ["course", "lesson", "bonsai_item", "subscription"],
      },
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      itemName: {
        type: String,
      },
    },
    balanceAfter: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "completed",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema)

export default Transaction
