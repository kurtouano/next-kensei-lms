"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Star, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export function CoursesSection({ courses, formatDate, formatCurrency }) {
  const router = useRouter()

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl">My Courses</CardTitle>
        <CardDescription className="text-sm">Manage your published courses</CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        {(!courses || courses.length === 0) ? (
          <div className="text-center py-12 px-4">
            <BookOpen className="mx-auto h-16 w-16 text-[#4a7c59] opacity-50 mb-4" />
            <h3 className="text-xl font-semibold text-[#2c3e2d] mb-2">No Courses Found</h3>
            <p className="text-[#4a7c59] mb-6 max-w-md mx-auto">
              You haven't created any courses yet. Start building your first course to share your knowledge with students.
            </p>
            <Button
              className="bg-[#4a7c59] hover:bg-[#3a6147]"
              onClick={() => router.push("/instructor/create-course")}
            >
              <Plus className="mr-2 h-4 w-4" /> Create Your First Course
            </Button>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-4 px-4">
              {courses.map((course) => (
                <Card key={course.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3 mb-3">
                      {course.thumbnail && (
                        <img 
                          src={course.thumbnail} 
                          alt={course.title}
                          className="w-16 h-16 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm leading-tight mb-1">{course.title}</div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Published {formatDate(course.published)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {course.modulesCount} modules • {course.lessonsCount} lessons
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-muted-foreground">Students:</span>
                        <div className="font-medium">{course.students.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Revenue:</span>
                        <div className="font-medium">{formatCurrency(course.revenue)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rating:</span>
                        <div className="flex items-center">
                          <span className="font-medium mr-1">{course.rating || '0.0'}</span>
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs text-muted-foreground ml-1">
                            ({course.ratingCount || 0})
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <div>
                          <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                            course.status === 'Published' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {course.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => router.push(`/instructor/courses/${course.id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => router.push(`/courses/${course.slug}?instructor-preview=true`)}
                      >
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left font-medium">Course</th>
                    <th className="pb-3 text-left font-medium">Students</th>
                    <th className="pb-3 text-left font-medium">Revenue</th>
                    <th className="pb-3 text-left font-medium">Rating</th>
                    <th className="pb-3 text-left font-medium">Status</th>
                    <th className="pb-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id} className="border-b">
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          {course.thumbnail && (
                            <img 
                              src={course.thumbnail} 
                              alt={course.title}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{course.title}</div>
                            <div className="text-sm text-muted-foreground">
                              Published {formatDate(course.published)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {course.modulesCount} modules • {course.lessonsCount} lessons
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">{course.students.toLocaleString()}</td>
                      <td className="py-4">{formatCurrency(course.revenue)}</td>
                      <td className="py-4">
                        <div className="flex items-center space-x-1">
                          <span>{course.rating || '0'}</span>
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs text-muted-foreground">
                            ({course.ratingCount || 0})
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          course.status === 'Published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/instructor/courses/${course.id}/edit`)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/courses/${course.slug}?instructor-preview=true`)}
                          >
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
