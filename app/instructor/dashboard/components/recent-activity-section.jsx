"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, UserPlus, Star, CheckCircle, Trophy, Heart, MessageCircle, Activity, User } from "lucide-react"
import { BonsaiSVG } from "@/app/bonsai/components/BonsaiSVG"

export function RecentActivitySection({ recentActivity, activityLoading, loadingMoreActivity, handleLoadMoreActivity }) {
  // Helper function to format relative time
  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Helper function to get activity icon
  const getActivityIcon = (type) => {
    const iconClass = "h-4 w-4 text-[#4a7c59]";
    
    switch (type) {
      case 'student_enrolled':
        return <UserPlus className={iconClass} />;
      case 'course_rated':
        return <Star className={iconClass} />;
      case 'lesson_completed':
        return <CheckCircle className={iconClass} />;
      case 'course_completed':
        return <Trophy className={iconClass} />;
      case 'course_liked':
        return <Heart className={iconClass} />;
      case 'question_asked':
        return <MessageCircle className={iconClass} />;
      default:
        return <Activity className={iconClass} />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm sm:text-base">Recent Activity</CardTitle>
        {activityLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-[#4a7c59]" />
        )}
      </CardHeader>
      <CardContent className="h-[200px] sm:h-[350px] overflow-y-auto">
        {recentActivity && recentActivity.activities && recentActivity.activities.length > 0 ? (
          <div>
            {recentActivity.activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 py-5 border-b hover:bg-[#eef2eb] transition-colors">
                <div className="flex-shrink-0">
                  {activity.user && activity.user.icon === 'bonsai' && activity.user.bonsai ? (
                    <div className="w-8 h-8 rounded-full border border-[#4a7c59] bg-[#eef2eb] flex items-center justify-center overflow-hidden">
                      <BonsaiSVG 
                        level={activity.user.bonsai.level || 1}
                        treeColor={activity.user.bonsai.customization?.foliageColor || '#77DD82'} 
                        potColor={activity.user.bonsai.customization?.potColor || '#FD9475'} 
                        selectedEyes={activity.user.bonsai.customization?.eyes || 'default_eyes'}
                        selectedMouth={activity.user.bonsai.customization?.mouth || 'default_mouth'}
                        selectedPotStyle={activity.user.bonsai.customization?.potStyle || 'default_pot'}
                        selectedGroundStyle={activity.user.bonsai.customization?.groundStyle || 'default_ground'}
                        decorations={activity.user.bonsai.customization?.decorations ? Object.values(activity.user.bonsai.customization.decorations).filter(Boolean) : []}
                        zoomed={true}
                      />
                    </div>
                  ) : activity.user && activity.user.avatar ? (
                    <img 
                      src={activity.user.avatar} 
                      alt={activity.user.name || 'User'}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        // Hide the broken image and show fallback
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ${
                      (activity.user && activity.user.avatar) || (activity.user && activity.user.icon === 'bonsai' && activity.user.bonsai) ? 'hidden' : 'flex'
                    }`}
                  >
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-2">
                      {/* Truncated activity message */}
                      <p className="text-sm font-medium text-[#2c3e2d] leading-tight truncate">
                        {activity.message && activity.message.length > 60 
                          ? `${activity.message.substring(0, 60)}...` 
                          : (activity.message || 'Recent activity')
                        }
                      </p>
                      
                      {/* Type-specific metadata */}
                      {activity.type === 'student_enrolled' && activity.metadata && activity.metadata.price > 0 && (
                        <p className="text-xs text-[#4a7c59] mt-1">
                          Revenue: {formatCurrency(activity.metadata.price)}
                        </p>
                      )}
                      
                      {activity.type === 'course_rated' && activity.metadata && activity.metadata.rating && (
                        <div className="flex items-center mt-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3 w-3 ${
                                  i < activity.metadata.rating 
                                    ? 'text-yellow-400 fill-yellow-400' 
                                    : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="ml-1 text-xs text-[#5c6d5e]">
                            {activity.metadata.rating}/5
                          </span>
                        </div>
                      )}

                      {/* Truncated question text */}
                      {activity.type === 'question_asked' && activity.metadata && activity.metadata.questionText && (
                        <p className="text-xs text-[#5c6d5e] mt-1 italic truncate">
                          "{activity.metadata.questionText.length > 50 
                            ? `${activity.metadata.questionText.substring(0, 50)}...` 
                            : activity.metadata.questionText
                          }"
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                      {getActivityIcon(activity.type)}
                      <span className="text-xs text-[#5c6d5e] whitespace-nowrap">
                        {formatRelativeTime(activity.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* View More Activity button */}
            {recentActivity.pagination && recentActivity.pagination.hasMore && (
              <div className="text-center pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-[#4a7c59] border-[#4a7c59] hover:bg-[#eef2eb]"
                  onClick={handleLoadMoreActivity}
                  disabled={loadingMoreActivity}
                >
                  {loadingMoreActivity ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'View More Activity'
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center text-muted-foreground">
            <div>
              <Activity className="mx-auto h-8 w-8 text-[#4a7c59] opacity-50 mb-2" />
              <p className="text-xs sm:text-sm">No recent activity yet</p>
              <p className="text-xs text-[#5c6d5e] mt-1">
                Activity will appear here when students interact with your courses
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
