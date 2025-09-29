# Jotatsu LMS - Feature Documentation

## 🎯 Overview
This document outlines the crucial features and implementations added to the Jotatsu Learning Management System.

---

## 💰 Automated Credit System

### **Auto-Calculated Credits Based on JLPT Level**
- **N5 (Beginner)**: 80 credits
- **N4 (Elementary)**: 120 credits  
- **N3 (Intermediate)**: 160 credits
- **N2 (Upper Intermediate)**: 200 credits
- **N1 (Advanced)**: 250 credits

### **Implementation**
- Credits automatically calculate when instructor selects JLPT level
- Credit reward field is read-only and static
- Tooltip shows credit breakdown for each level
- Balanced progression: 2-4 courses needed to reach next bonsai level

---

## 🎁 Flexible Item Reward System

### **Item Count Options**
- **1 Item**: Students receive 1 random item
- **2 Items**: Students receive 2 random items
- **Default**: All courses automatically have item rewards enabled

### **Credit Compensation**
- **80 credits per item** when user owns all items
- **Partial rewards**: Available items + 80 credits per missing item
- **Smart system**: Ensures students always get appropriate rewards

### **Rarity System with Drop Chances**

| Rarity | Price Range | Weight | Drop Chance | Examples |
|--------|-------------|--------|-------------|----------|
| **Common** | 0 credits | 50 | 50% | Default eyes, basic mouths |
| **Uncommon** | 1-50 credits | 30 | 30% | Basic decorations |
| **Rare** | 51-100 credits | 15 | 15% | Christmas Cap (100 credits) |
| **Epic** | 101-200 credits | 4 | 4% | Crown (200 credits) |
| **Legendary** | 201+ credits | 1 | 1% | Wizard Hat (250 credits) |

### **Implementation Details**
- Weighted random selection based on item rarity
- No duplicate items in single reward
- Console logs show item rarity for debugging
- Balanced drop rates favor common items, rare items are special

---

## 💬 Real-Time Chat System

### **Polling Implementation**
- **Interval**: Every 2 seconds
- **Purpose**: Real-time message updates without WebSocket complexity
- **Performance**: Optimized to handle multiple concurrent chats
- **Fallback**: Reliable connection even with network issues

### **Features**
- Live message updates
- Online status tracking
- Group chat support
- Message history persistence

---

## 🔗 Group Chat Invite System

### **Invite Link Generation**
- **Unique Links**: Each group chat generates unique invite links
- **Secure Access**: Links contain encrypted identifiers
- **Easy Sharing**: Users can share links to invite friends
- **Auto-Join**: Clicking link automatically adds user to chat

### **Implementation**
- Secure token-based invite system
- One-click join functionality
- Permission validation
- Automatic group member updates

---

## 🌳 Bonsai Progression System

### **Lifetime Credits System**
- **Spendable Credits**: Can be used to purchase items
- **Lifetime Credits**: Total earned, never decreases
- **Bonsai Levels**: Based on lifetime credits (stable progression)
- **Level Thresholds**:
  - Level 1: 0-399 credits (Small Tree)
  - Level 2: 400-799 credits (Medium Tree)  
  - Level 3: 800+ credits (Big Tree)

### **Credit Earning**
- Course completion rewards
- Random item compensation
- Milestone achievements
- Both spendable and lifetime credits increase

---

## 📧 Email System Improvements

### **Blog Subscription**
- **Fixed Unsubscribe Links**: Changed from localhost to jotatsu.com
- **Logo Integration**: Updated to use correct logo filename
- **Resubscription Logic**: Welcome emails sent for reactivated subscriptions
- **Clean Content**: Removed unnecessary text and simplified messaging

### **Email Templates**
- Professional design with Jotatsu branding
- Clear unsubscribe instructions
- Responsive layout for all devices

---

## 🎨 UI/UX Improvements

### **Course Creation Form**
- **Consistent Styling**: All form fields match design system
- **Auto-Calculation**: Credits calculate automatically
- **Tooltips**: Helpful information for complex features
- **Validation**: Real-time form validation with clear error messages

### **Responsive Design**
- Mobile-friendly interfaces
- Consistent spacing and typography
- Accessible form controls
- Professional color scheme

---

## 🔧 Technical Implementation

### **Database Migrations**
- **User Credits**: Updated all users to 150 initial credits
- **Lifetime Credits**: Added lifetime tracking system
- **Course Items**: Added randomItemCount field to existing courses
- **Backward Compatibility**: All existing data preserved

### **API Enhancements**
- **Weighted Selection**: Rarity-based item selection algorithm
- **Credit Calculations**: Dynamic credit rewards based on JLPT level
- **Error Handling**: Robust error handling for all operations
- **Performance**: Optimized database queries and caching

---

## 📊 System Statistics

### **Current Implementation**
- **8 Courses**: All migrated with randomItemCount field
- **24 Users**: All have lifetime credits system
- **5 Rarity Tiers**: Balanced drop system
- **2 Polling Intervals**: Chat and notifications
- **Multiple Email Templates**: Blog and system emails

### **Performance Metrics**
- **Fast Response Times**: < 2 seconds for most operations
- **Reliable Chat**: 2-second polling ensures real-time feel
- **Balanced Rewards**: Rarity system prevents item inflation
- **User Retention**: Progression system encourages completion

---

## 🚀 Future Enhancements

### **Planned Features**
- Push notifications for real-time updates
- Advanced rarity tiers for special events
- Social features for group learning
- Analytics dashboard for instructors

### **Scalability**
- Database optimization for growing user base
- Caching strategies for improved performance
- CDN integration for global access
- Mobile app development

---

*Last Updated: December 2024*
*Version: 1.0*
