// models/Blog.js - SIMPLIFIED VERSION (Remove Featured Priority)
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
    // SIMPLIFIED: Only featured flag, no priority
    isFeatured: {
      type: Boolean,
      default: false,
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
      type: String,
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
BlogSchema.index({ isFeatured: -1, createdAt: -1 }); // SIMPLIFIED: Sort by newest featured

// Pre-save middleware to auto-generate slug and calculate read time
BlogSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  if (!this.readTime && this.content) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    this.readTime = `${minutes} min read`;
  }

  next();
});

// SIMPLIFIED: Featured blogs sorted by newest first
BlogSchema.statics.getFeaturedBlogs = function(limit = 3) {
  return this.find({ isFeatured: true })
    .populate('author', 'name icon')
    .sort({ createdAt: -1 }) // Newest featured first
    .limit(limit);
};

// Recent blogs (non-featured)
BlogSchema.statics.getRecentBlogs = function(limit = 6) {
  return this.find({ isFeatured: false })
    .populate('author', 'name icon')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get all blogs with filters
BlogSchema.statics.getBlogs = function(filters = {}) {
  const query = {};
  
  if (filters.category && filters.category !== 'all') {
    query.category = filters.category;
  }
  
  if (filters.author && filters.author !== 'all') {
    query.author = filters.author;
  }

  if (filters.featured === 'true') {
    query.isFeatured = true;
  } else if (filters.featured === 'false') {
    query.isFeatured = false;
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
      case 'featured':
        sortBy = { isFeatured: -1, createdAt: -1 }; // SIMPLIFIED: Featured first, then newest
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

// Keep all other existing methods...
BlogSchema.statics.incrementViews = function(blogId) {
  return this.findByIdAndUpdate(
    blogId, 
    { $inc: { views: 1 } },
    { new: true }
  );
};

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

BlogSchema.statics.getPopularPosts = function(limit = 3) {
  return this.find({})
    .sort({ views: -1, likeCount: -1 })
    .limit(limit)
    .select('title slug featuredImage category')
    .populate('author', 'name');
};

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

BlogSchema.statics.getLatestPosts = function(limit = 6) {
  return this.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('author', 'name icon')
    .select('title slug excerpt featuredImage category readTime views likeCount createdAt');
};

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