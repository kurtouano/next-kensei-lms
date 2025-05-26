"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, LineChart, PieChart, Users, BookOpen, DollarSign, Star, Plus, FileText } from "lucide-react"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data for courses
  const courses = [
    {
      id: 1,
      title: "Japanese for Beginners",
      students: 1245,
      revenue: 24900,
      rating: 4.8,
      published: "2023-05-15",
      status: "Published",
    },
    {
      id: 2,
      title: "Intermediate Kanji",
      students: 876,
      revenue: 17520,
      rating: 4.7,
      published: "2023-07-22",
      status: "Published",
    },
    {
      id: 3,
      title: "Business Japanese",
      students: 543,
      revenue: 16290,
      rating: 4.6,
      published: "2023-09-10",
      status: "Published",
    },
    {
      id: 4,
      title: "JLPT N3 Preparation",
      students: 1102,
      revenue: 33060,
      rating: 4.9,
      published: "2023-03-05",
      status: "Published",
    },
    {
      id: 5,
      title: "Japanese Conversation Practice",
      students: 687,
      revenue: 13740,
      rating: 4.5,
      published: "2023-11-18",
      status: "Published",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2c3e2d]">Instructor Dashboard</h1>
          <p className="text-[#4a7c59]">Manage your courses and view analytics</p>
        </div>
        <Button
          className="bg-[#4a7c59] hover:bg-[#3a6147]"
          onClick={() => (window.location.href = "/instructor/create-course")}
        >
          <Plus className="mr-2 h-4 w-4" /> Create New Course
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-[#eef2eb]">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="courses" className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white">
            My Courses
          </TabsTrigger>
          <TabsTrigger value="create" className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white">
            Create Course
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white">
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-[#4a7c59]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4,453</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-[#4a7c59]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">+1 new this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-[#4a7c59]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$105,510</div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-[#4a7c59]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.7</div>
                <p className="text-xs text-muted-foreground">+0.2 from last month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BarChart className="mx-auto h-16 w-16 text-[#4a7c59] opacity-50" />
                  <p className="mt-2">Revenue chart would appear here</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Student Enrollment</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <LineChart className="mx-auto h-16 w-16 text-[#4a7c59] opacity-50" />
                  <p className="mt-2">Enrollment chart would appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
              <CardDescription>Manage your published courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
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
                          <div className="font-medium">{course.title}</div>
                          <div className="text-sm text-muted-foreground">Published {course.published}</div>
                        </td>
                        <td className="py-4">{course.students.toLocaleString()}</td>
                        <td className="py-4">${course.revenue.toLocaleString()}</td>
                        <td className="py-4">{course.rating} ★</td>
                        <td className="py-4">
                          <span className="inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                            {course.status}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Course Tab */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Course</CardTitle>
              <CardDescription>Fill in the details to create a new course</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">
                      Course Title
                    </label>
                    <input
                      id="title"
                      className="w-full rounded-md border border-gray-300 p-2"
                      placeholder="Enter course title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">
                      Category
                    </label>
                    <select id="category" className="w-full rounded-md border border-gray-300 p-2">
                      <option value="">Select category</option>
                      <option value="beginner">Beginner Japanese</option>
                      <option value="intermediate">Intermediate Japanese</option>
                      <option value="advanced">Advanced Japanese</option>
                      <option value="business">Business Japanese</option>
                      <option value="jlpt">JLPT Preparation</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Course Description
                  </label>
                  <textarea
                    id="description"
                    className="h-32 w-full rounded-md border border-gray-300 p-2"
                    placeholder="Enter course description"
                  ></textarea>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="price" className="text-sm font-medium">
                      Price ($)
                    </label>
                    <input
                      id="price"
                      type="number"
                      className="w-full rounded-md border border-gray-300 p-2"
                      placeholder="29.99"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="level" className="text-sm font-medium">
                      Difficulty Level
                    </label>
                    <select id="level" className="w-full rounded-md border border-gray-300 p-2">
                      <option value="">Select level</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="image" className="text-sm font-medium">
                    Course Image
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="h-32 w-32 rounded-md border border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center">
                        <Plus className="mx-auto h-8 w-8 text-gray-400" />
                        <span className="mt-1 text-xs text-gray-500">Upload Image</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>Recommended size: 1280x720 pixels</p>
                      <p>Max file size: 5MB</p>
                      <p>Supported formats: JPG, PNG</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Course Content</h3>
                  <div className="rounded-md border border-gray-300 p-4">
                    <div className="flex justify-between">
                      <h4 className="font-medium">Modules</h4>
                      <Button variant="outline" size="sm">
                        <Plus className="mr-1 h-4 w-4" /> Add Module
                      </Button>
                    </div>
                    <div className="mt-4 text-center text-sm text-gray-500">
                      <FileText className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-2">No modules added yet</p>
                      <p>Click "Add Module" to create your course structure</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline">Save as Draft</Button>
                  <Button
                    className="bg-[#4a7c59] hover:bg-[#3a6147]"
                    onClick={() => (window.location.href = "/instructor/create-course")}
                  >
                    Go to Course Builder
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Course Analytics</CardTitle>
              <CardDescription>View detailed performance metrics for your courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Revenue by Course</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <PieChart className="mx-auto h-16 w-16 text-[#4a7c59] opacity-50" />
                      <p className="mt-2">Revenue distribution chart would appear here</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Student Engagement</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <BarChart className="mx-auto h-16 w-16 text-[#4a7c59] opacity-50" />
                      <p className="mt-2">Engagement metrics would appear here</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Course Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="pb-3 text-left font-medium">Course</th>
                          <th className="pb-3 text-left font-medium">Completion Rate</th>
                          <th className="pb-3 text-left font-medium">Avg. Rating</th>
                          <th className="pb-3 text-left font-medium">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map((course) => (
                          <tr key={course.id} className="border-b">
                            <td className="py-4 font-medium">{course.title}</td>
                            <td className="py-4">{Math.floor(Math.random() * 30) + 70}%</td>
                            <td className="py-4">{course.rating} ★</td>
                            <td className="py-4">${course.revenue.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
