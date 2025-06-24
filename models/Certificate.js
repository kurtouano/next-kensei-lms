// models/Certificate.js - FIXED VERSION
import mongoose from "mongoose"

const CertificateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    certificateId: {
      type: String,
      required: true,
      unique: true,
    },
    completionDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    courseTitle: {
      type: String,
      required: true,
    },
    instructorName: {
      type: String,
      required: true,
    },
  },
  { 
    timestamps: true,
    indexes: [
      { user: 1, course: 1 }, // Compound index for user-course lookup
      { certificateId: 1 }, // Unique index for certificate ID
      { completionDate: -1 } // Index for sorting by completion date
    ]
  }
)

// FIXED: Generate unique certificate ID before saving
CertificateSchema.pre('save', function(next) {
  // Only generate ID if it's not already set
  if (!this.certificateId || this.certificateId === '') {
    const timestamp = Date.now().toString(36)
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase()
    this.certificateId = `BONSAI-CERT-${timestamp}-${randomSuffix}`
    console.log('🆔 Auto-generated certificate ID:', this.certificateId)
  }
  next()
})

// Compound index to ensure one certificate per user per course
CertificateSchema.index({ user: 1, course: 1 }, { unique: true })

// Static method to find certificate by ID
CertificateSchema.statics.findByCertificateId = function(certificateId) {
  return this.findOne({ certificateId })
    .populate('user', 'name email icon')
    .populate('course', 'title slug level')
}

// Static method to get user certificates
CertificateSchema.statics.getUserCertificates = function(userId) {
  return this.find({ user: userId })
    .populate('course', 'title slug level thumbnail')
    .sort({ completionDate: -1 })
}

const Certificate = mongoose.models.Certificate || mongoose.model("Certificate", CertificateSchema)

export default Certificate