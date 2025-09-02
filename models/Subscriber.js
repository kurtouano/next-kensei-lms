import mongoose from "mongoose"

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date
  },
  source: {
    type: String,
    default: 'blog_page',
    enum: ['blog_page', 'footer', 'course_page', 'manual']
  },
  lastEmailSent: {
    type: Date
  },
  emailCount: {
    type: Number,
    default: 0
  },
  preferences: {
    blogUpdates: { type: Boolean, default: true },
    courseUpdates: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: false }
  }
}, {
  timestamps: true
})

// Index for faster queries
subscriberSchema.index({ isActive: 1 })
subscriberSchema.index({ source: 1 })

const Subscriber = mongoose.models.Subscriber || mongoose.model("Subscriber", subscriberSchema)

export default Subscriber
