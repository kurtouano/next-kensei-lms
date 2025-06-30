// models/Blog.js - UPDATED VERSION
import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a blog title"],
      trim: true,
      maxlength: [200, "Blog title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: [true, "Please provide a blog excerpt"],
      maxlength: [500, "Excerpt cannot exceed 500 characters"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Please provide blog content"],
    },
    featuredImage: {
      type: String,
      required: false, 
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Grammar", 
        "Vocabulary", 
        "Culture", 
        "Travel", 
        "Business", 
        "Food", 
        "Entertainment"
      ],
      required: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    readTime: {
      type: String, // e.g., "8 min read" - will be calculated automatically
    },
    views: {
      type: Number,
      default: 0,
    },
    likedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    likeCount: {
      type: Number,
      default: 0,
    },
    metaDescription: {
      type: String,
      maxlength: [160, "Meta description cannot exceed 160 characters"],
      trim: true,
    },
    metaKeywords: {
      type: String,
      trim: true,
    },
  },
  { 
    timestamps: true
  }
);

// Indexes for better performance
BlogSchema.index({ createdAt: -1 });
BlogSchema.index({ category: 1, createdAt: -1 });
BlogSchema.index({ author: 1, createdAt: -1 });
BlogSchema.index({ views: -1 });
BlogSchema.index({ likeCount: -1 });

// Pre-save middleware to auto-generate slug and calculate read time
BlogSchema.pre('save', function(next) {
  // Auto-generate slug from title if not provided
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim('-'); // Remove leading/trailing hyphens
  }

  // Calculate read time based on content length
  if (!this.readTime && this.content) {
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = this.content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    this.readTime = `${minutes} min read`;
  }

  next();
});

// Static method to get all blogs with filters
BlogSchema.statics.getBlogs = function(filters = {}) {
  const query = {};
  
  if (filters.category && filters.category !== 'all') {
    query.category = filters.category;
  }
  
  if (filters.author && filters.author !== 'all') {
    query.author = filters.author;
  }

  // Date filters
  if (filters.dateRange) {
    const now = new Date();
    switch (filters.dateRange) {
      case 'last-month':
        query.createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
        break;
      case 'last-3-months':
        query.createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 3)) };
        break;
      case 'last-year':
        query.createdAt = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
        break;
    }
  }

  // Search functionality
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { excerpt: { $regex: filters.search, $options: 'i' } },
      { content: { $regex: filters.search, $options: 'i' } },
      { tags: { $in: [new RegExp(filters.search, 'i')] } }
    ];
  }

  let sortBy = { createdAt: -1 }; // Default: newest first
  
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'oldest':
        sortBy = { createdAt: 1 };
        break;
      case 'popular':
        sortBy = { views: -1, likeCount: -1 };
        break;
      case 'newest':
      default:
        sortBy = { createdAt: -1 };
        break;
    }
  }

  return this.find(query)
    .populate('author', 'name icon')
    .sort(sortBy);
};

// Static method to get featured blog (most popular recent blog)
BlogSchema.statics.getFeaturedBlog = function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return this.findOne({ 
    createdAt: { $gte: thirtyDaysAgo }
  })
  .populate('author', 'name icon')
  .sort({ views: -1, likeCount: -1, createdAt: -1 });
};

// Static method to increment view count
BlogSchema.statics.incrementViews = function(blogId) {
  return this.findByIdAndUpdate(
    blogId, 
    { $inc: { views: 1 } },
    { new: true }
  );
};

// Method to toggle like
BlogSchema.methods.toggleLike = function(userId) {
  const isLiked = this.likedBy.includes(userId);
  
  if (isLiked) {
    this.likedBy.pull(userId);
    this.likeCount = Math.max(0, this.likeCount - 1);
  } else {
    this.likedBy.push(userId);
    this.likeCount += 1;
  }
  
  return this.save();
};

// Static method to get popular posts (for sidebar)
BlogSchema.statics.getPopularPosts = function(limit = 3) {
  return this.find({})
    .sort({ views: -1, likeCount: -1 })
    .limit(limit)
    .select('title slug featuredImage category')
    .populate('author', 'name');
};

// Static method to get related posts
BlogSchema.statics.getRelatedPosts = function(blogId, category, limit = 3) {
  return this.find({ 
    _id: { $ne: blogId },
    category: category
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .select('title slug featuredImage readTime')
  .populate('author', 'name');
};

// Static method to get latest posts
BlogSchema.statics.getLatestPosts = function(limit = 6) {
  return this.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('author', 'name icon')
    .select('title slug excerpt featuredImage category readTime views likeCount createdAt');
};

// Static method to get category statistics
BlogSchema.statics.getCategoryStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
export default Blog;