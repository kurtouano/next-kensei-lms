"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BonsaiIcon } from "@/components/bonsai-icon"
import { User, Settings, Award, BookOpen, Bell, ChevronRight, Check, Globe, Mail, Lock, Flag } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { signOut, useSession } from "next-auth/react"
import axios from "axios"
import { format } from "date-fns"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile")
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState(null);

  // Mock user data
  const user = {
    username: session?.user?.name,
    country: "United States",
    joinDate: userData?.joinDate,
    learningGoals: ["Pass JLPT N4", "Read manga in Japanese", "Travel to Japan"],
    languages: ["English (Native)", "Japanese (Beginner)"],
    bonsaiLevel: 3,
    bonsaiCredits: 450,
    progress: {
      coursesCompleted: 2,
      lessonsCompleted: 24,
      quizzesCompleted: 12,
      streak: 7,
    },
    certifications: [
      { id: 1, title: "Japanese Basics", date: "March 2023", level: "Beginner" },
      { id: 2, title: "Hiragana Mastery", date: "April 2023", level: "Beginner" },
    ],
    notifications: [
      { id: 1, type: "course", message: "New course available: Japanese Cooking Terms", date: "2 days ago" },
      { id: 2, type: "achievement", message: "You've earned the '7-Day Streak' badge!", date: "1 week ago" },
      { id: 3, type: "system", message: "Your account has been verified", date: "2 weeks ago" },
    ],
    bonsai: {
      tree: "Maple",
      pot: "Traditional Blue",
      decorations: ["Stone Lantern", "Moss"],
    },
  }

  useEffect(() => {
    if (session) {
      axios.get("/api/profile").then(res => {
        const created = new Date(res.data.user.createdAt);
        setUserData({
          username: res.data.user.name,
          joinDate: format(created, "MMMM yyyy"), 
        });
      });
    }
  }, [session]);

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      {/* Header */}
      <Header isLoggedIn={true} />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center">
              <div className="mr-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#eef2eb]">
                <BonsaiIcon className="h-12 w-12 text-[#4a7c59]" />
              </div>
              <div>
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-[#2c3e2d]">{user.username}</h1>
                  <div className="ml-2 rounded-full bg-[#eef2eb] px-2 py-0.5">
                    <Check className="h-4 w-4 text-[#4a7c59]" />
                  </div>
                </div>
                <p className="text-[#5c6d5e]">Joined {user.joinDate}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center rounded-full bg-[#eef2eb] px-4 py-2">
                <BookOpen className="mr-2 h-4 w-4 text-[#4a7c59]" />
                <span className="text-sm font-medium text-[#2c3e2d]">Level {user.bonsaiLevel} Learner</span>
              </div>
              <div className="flex items-center rounded-full bg-[#eef2eb] px-4 py-2">
                <BonsaiIcon className="mr-2 h-4 w-4 text-[#4a7c59]" />
                <span className="text-sm font-medium text-[#2c3e2d]">{user.bonsaiCredits} Credits</span>
              </div>
              <div className="flex items-center rounded-full bg-[#eef2eb] px-4 py-2">
                <Flag className="mr-2 h-4 w-4 text-[#4a7c59]" />
                <span className="text-sm font-medium text-[#2c3e2d]">{user.country}</span>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-[#eef2eb]">
              <TabsTrigger value="profile" className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white">
                <User className="mr-2 h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="certifications"
                className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white"
              >
                <Award className="mr-2 h-4 w-4" />
                Certifications
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white"
              >
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-0 border-0 p-0">
              <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Summary */}
                <div className="md:col-span-2 space-y-6">
                  {/* Learning Progress */}
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">Learning Progress</h2>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="rounded-lg bg-[#eef2eb] p-4 text-center">
                        <p className="text-2xl font-bold text-[#4a7c59]">{user.progress.coursesCompleted}</p>
                        <p className="text-sm text-[#5c6d5e]">Courses Completed</p>
                      </div>
                      <div className="rounded-lg bg-[#eef2eb] p-4 text-center">
                        <p className="text-2xl font-bold text-[#4a7c59]">{user.progress.lessonsCompleted}</p>
                        <p className="text-sm text-[#5c6d5e]">Lessons Completed</p>
                      </div>
                      <div className="rounded-lg bg-[#eef2eb] p-4 text-center">
                        <p className="text-2xl font-bold text-[#4a7c59]">{user.progress.quizzesCompleted}</p>
                        <p className="text-sm text-[#5c6d5e]">Quizzes Passed</p>
                      </div>
                      <div className="rounded-lg bg-[#eef2eb] p-4 text-center">
                        <p className="text-2xl font-bold text-[#4a7c59]">{user.progress.streak}</p>
                        <p className="text-sm text-[#5c6d5e]">Day Streak</p>
                      </div>
                    </div>
                  </div>

                  {/* Learning Goals */}
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">Learning Goals</h2>
                    <ul className="space-y-2">
                      {user.learningGoals.map((goal, index) => (
                        <li key={index} className="flex items-center">
                          <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#eef2eb]">
                            <Check className="h-4 w-4 text-[#4a7c59]" />
                          </div>
                          <span className="text-[#2c3e2d]">{goal}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="mt-4 bg-[#4a7c59] text-white hover:bg-[#3a6147]">Edit Goals</Button>
                  </div>

                  {/* Languages */}
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">Languages</h2>
                    <ul className="space-y-2">
                      {user.languages.map((language, index) => (
                        <li key={index} className="flex items-center">
                          <Globe className="mr-3 h-5 w-5 text-[#4a7c59]" />
                          <span className="text-[#2c3e2d]">{language}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="mt-4 bg-[#4a7c59] text-white hover:bg-[#3a6147]">Add Language</Button>
                  </div>
                </div>

                {/* Bonsai Preview */}
                <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                  <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">My Bonsai</h2>
                  <div className="mb-6 flex flex-col items-center">
                    <div className="relative mb-4 h-48 w-48">
                      <div className="absolute bottom-0 left-1/2 h-16 w-24 -translate-x-1/2 rounded-t-sm rounded-b-xl bg-[#5b8fb0]"></div>
                      <div className="absolute bottom-12 left-1/2 h-24 w-4 -translate-x-1/2 bg-[#8B5E3C]"></div>
                      <div className="absolute bottom-24 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-[#4a7c59]"></div>
                      <div className="absolute bottom-28 left-1/4 h-12 w-12 -translate-x-1/2 rounded-full bg-[#5d9e75]"></div>
                      <div className="absolute bottom-28 right-1/4 h-12 w-12 translate-x-1/2 rounded-full bg-[#5d9e75]"></div>
                      <div className="absolute bottom-32 left-1/2 h-14 w-14 -translate-x-1/2 rounded-full bg-[#6fb58a]"></div>
                      <div className="absolute bottom-6 right-12 h-6 w-6 rounded-md bg-[#d3d3d3]"></div>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-[#2c3e2d]">{user.bonsai.tree} Bonsai</p>
                      <p className="text-sm text-[#5c6d5e]">{user.bonsai.pot}</p>
                      <p className="text-sm text-[#5c6d5e]">Decorations: {user.bonsai.decorations.join(", ")}</p>
                    </div>
                  </div>
                  <Button className="w-full bg-[#4a7c59] text-white hover:bg-[#3a6147]" asChild>
                    <Link href="/bonsai">
                      Customize My Bonsai
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="certifications" className="mt-0 border-0 p-0">
              <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                <h2 className="mb-6 text-xl font-semibold text-[#2c3e2d]">My Certifications</h2>

                {user.certifications.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {user.certifications.map((cert) => (
                      <div key={cert.id} className="rounded-lg border border-[#dce4d7] bg-[#eef2eb] p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#4a7c59]">
                            {cert.level}
                          </span>
                          <span className="text-xs text-[#5c6d5e]">{cert.date}</span>
                        </div>
                        <div className="mb-4 flex items-center">
                          <Award className="mr-3 h-8 w-8 text-[#4a7c59]" />
                          <h3 className="text-lg font-semibold text-[#2c3e2d]">{cert.title}</h3>
                        </div>
                        <div className="flex justify-between">
                          <Button variant="outline" size="sm" className="border-[#4a7c59] text-[#4a7c59]">
                            View Details
                          </Button>
                          <Button variant="outline" size="sm" className="border-[#4a7c59] text-[#4a7c59]">
                            Share
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-[#dce4d7] bg-[#f8f7f4] p-8 text-center">
                    <Award className="mx-auto mb-4 h-12 w-12 text-[#5c6d5e] opacity-50" />
                    <h3 className="mb-2 text-lg font-medium text-[#2c3e2d]">No Certifications Yet</h3>
                    <p className="mb-4 text-[#5c6d5e]">
                      Complete courses and pass certification tests to earn your first certificate.
                    </p>
                    <Button className="bg-[#4a7c59] text-white hover:bg-[#3a6147]" asChild>
                      <Link href="/courses">Browse Courses</Link>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0 border-0 p-0">
              <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#2c3e2d]">Notifications</h2>
                  <Button variant="outline" size="sm" className="border-[#4a7c59] text-[#4a7c59]">
                    Mark All as Read
                  </Button>
                </div>

                {user.notifications.length > 0 ? (
                  <div className="divide-y divide-[#dce4d7]">
                    {user.notifications.map((notification) => (
                      <div key={notification.id} className="py-4">
                        <div className="flex items-start">
                          {notification.type === "course" ? (
                            <BookOpen className="mr-3 mt-1 h-5 w-5 text-[#4a7c59]" />
                          ) : notification.type === "achievement" ? (
                            <Award className="mr-3 mt-1 h-5 w-5 text-[#4a7c59]" />
                          ) : (
                            <Bell className="mr-3 mt-1 h-5 w-5 text-[#4a7c59]" />
                          )}
                          <div className="flex-1">
                            <p className="text-[#2c3e2d]">{notification.message}</p>
                            <p className="text-xs text-[#5c6d5e]">{notification.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-[#dce4d7] bg-[#f8f7f4] p-8 text-center">
                    <Bell className="mx-auto mb-4 h-12 w-12 text-[#5c6d5e] opacity-50" />
                    <h3 className="mb-2 text-lg font-medium text-[#2c3e2d]">No Notifications</h3>
                    <p className="text-[#5c6d5e]">
                      You're all caught up! We'll notify you about new courses and achievements.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-0 border-0 p-0">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Account Settings */}
                <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                  <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">Account Settings</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-[#2c3e2d]">Username</label>
                      <div className="flex">
                        <input
                          type="text"
                          value={user.username}
                          className="flex-1 rounded-md border border-[#dce4d7] bg-white px-3 py-2 text-[#2c3e2d] focus:border-[#4a7c59] focus:outline-none"
                          readOnly
                        />
                        <Button variant="outline" size="sm" className="ml-2 border-[#4a7c59] text-[#4a7c59]">
                          Edit
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-[#2c3e2d]">Email</label>
                      <div className="flex items-center rounded-md border border-[#dce4d7] bg-[#f8f7f4] px-3 py-2">
                        <Mail className="mr-2 h-4 w-4 text-[#5c6d5e]" />
                        <span className="text-[#5c6d5e]">user@example.com</span>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-[#2c3e2d]">Password</label>
                      <Button variant="outline" className="w-full border-[#4a7c59] text-[#4a7c59]">
                        <Lock className="mr-2 h-4 w-4" />
                        Change Password
                      </Button>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-[#2c3e2d]">Country</label>
                      <div className="flex">
                        <select className="flex-1 rounded-md border border-[#dce4d7] bg-white px-3 py-2 text-[#2c3e2d] focus:border-[#4a7c59] focus:outline-none">
                          <option value="US">United States</option>
                          <option value="JP">Japan</option>
                          <option value="CA">Canada</option>
                          <option value="UK">United Kingdom</option>
                          <option value="AU">Australia</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <Button className="mt-6 w-full bg-[#4a7c59] text-white hover:bg-[#3a6147]">Save Changes</Button>
                </div>

                {/* Notification Settings */}
                <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                  <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">Notification Settings</h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-[#2c3e2d]">Email Notifications</h3>
                        <p className="text-sm text-[#5c6d5e]">Receive updates via email</p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" className="peer sr-only" defaultChecked />
                        <div className="peer h-6 w-11 rounded-full bg-[#dce4d7] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#4a7c59] peer-checked:after:translate-x-full peer-focus:outline-none"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-[#2c3e2d]">New Course Alerts</h3>
                        <p className="text-sm text-[#5c6d5e]">Get notified about new courses</p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" className="peer sr-only" defaultChecked />
                        <div className="peer h-6 w-11 rounded-full bg-[#dce4d7] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#4a7c59] peer-checked:after:translate-x-full peer-focus:outline-  peer-checked:bg-[#4a7c59] peer-checked:after:translate-x-full peer-focus:outline-none"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-[#2c3e2d]">Achievement Notifications</h3>
                        <p className="text-sm text-[#5c6d5e]">Get notified about your achievements</p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" className="peer sr-only" defaultChecked />
                        <div className="peer h-6 w-11 rounded-full bg-[#dce4d7] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#4a7c59] peer-checked:after:translate-x-full peer-focus:outline-none"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-[#2c3e2d]">Learning Reminders</h3>
                        <p className="text-sm text-[#5c6d5e]">Daily reminders to continue learning</p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" className="peer sr-only" defaultChecked />
                        <div className="peer h-6 w-11 rounded-full bg-[#dce4d7] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#4a7c59] peer-checked:after:translate-x-full peer-focus:outline-none"></div>
                      </label>
                    </div>
                  </div>

                  <Button className="mt-6 w-full bg-[#4a7c59] text-white hover:bg-[#3a6147]">Save Preferences</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
