import { useMemo, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts'
import { TrendingUp } from "lucide-react"

export function CoursePerformanceChart({ courses, stats, monthlyData = [] }) {
  const [activeTab, setActiveTab] = useState("enrollments")

  // Use provided monthlyData or generate fallback data
  const chartData = useMemo(() => {
    if (monthlyData && monthlyData.length > 0) {
      return monthlyData
    }
    
    // Fallback: generate mock data for demonstration
    const months = []
    const now = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      
      months.push({
        month: monthName,
        enrollments: Math.floor(Math.random() * 50) + 10,
        revenue: Math.floor(Math.random() * 2000) + 500,
        courses: Math.min(courses?.length || 1, 3)
      })
    }
    return months
  }, [monthlyData, courses])

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    if (chartData.length < 2) return null

    const thisMonth = chartData[chartData.length - 1]
    const lastMonth = chartData[chartData.length - 2]
    const yearToDate = chartData.reduce((sum, month) => sum + (month.enrollments || 0), 0)
    const lastYearToDate = chartData.slice(0, -1).reduce((sum, month) => sum + (month.enrollments || 0), 0)

    const monthlyGrowth = lastMonth.enrollments > 0 
      ? ((thisMonth.enrollments - lastMonth.enrollments) / lastMonth.enrollments) * 100 
      : 0

    const yearlyGrowth = lastYearToDate > 0 
      ? ((yearToDate - lastYearToDate) / lastYearToDate) * 100 
      : 0

    const avgMonthly = chartData.reduce((sum, month) => sum + (month.enrollments || 0), 0) / chartData.length

    const bestMonth = chartData.reduce((best, month) => 
      (month.enrollments || 0) > (best.enrollments || 0) ? month : best, chartData[0])

    return {
      thisMonth: thisMonth.enrollments || 0,
      lastMonth: lastMonth.enrollments || 0,
      monthlyGrowth,
      yearToDate,
      yearlyGrowth,
      avgMonthly: Math.round(avgMonthly),
      bestMonth: bestMonth.month,
      bestMonthValue: bestMonth.enrollments || 0
    }
  }, [chartData])

  // Course distribution data for pie chart
  const courseDistribution = useMemo(() => {
    if (!courses || courses.length === 0) return []
    
    return courses.slice(0, 5).map((course, index) => ({
      name: course.title && course.title.length > 20 ? course.title.substring(0, 20) + '...' : course.title || 'Untitled Course',
      value: course.students || 0,
      color: ['#4a7c59', '#6fb58a', '#8bc8a3', '#a8dbc0', '#c5eddd'][index % 5]
    }))
  }, [courses])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value)
  }

  const getGrowthIcon = (growth) => {
    if (growth > 0) return <ArrowUp className="h-4 w-4 text-green-600" />
    if (growth < 0) return <ArrowDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const getGrowthColor = (growth) => {
    if (growth > 0) return "text-green-600"
    if (growth < 0) return "text-red-600"
    return "text-gray-400"
  }

  // If no data, show a simple message
  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center text-muted-foreground p-6">
        <div>
          <TrendingUp className="mx-auto h-12 w-12 text-[#4a7c59] opacity-50 mb-4" />
          <p className="text-sm">No performance data available yet</p>
          <p className="text-xs text-[#5c6d5e] mt-1">
            Data will appear here as students enroll in your courses
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Charts */}
      <div className="h-56 sm:h-72">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="enrollments" className="text-xs">Students</TabsTrigger>
            <TabsTrigger value="revenue" className="text-xs">Revenue</TabsTrigger>
          </TabsList>

          <TabsContent value="enrollments" className="mt-2">
            <div className="h-48 sm:h-64 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#666"
                    fontSize={10}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={10}
                    width={30}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      fontSize: '12px'
                    }}
                    formatter={(value, name) => [value, 'Students']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="enrollments" 
                    stroke="#4a7c59" 
                    strokeWidth={2}
                    dot={{ fill: '#4a7c59', strokeWidth: 1, r: 3 }}
                    activeDot={{ r: 4, fill: '#3a6147' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="mt-2">
            <div className="h-48 sm:h-64 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#666"
                    fontSize={10}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={10}
                    width={50}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      fontSize: '12px'
                    }}
                    formatter={(value, name) => [formatCurrency(value), 'Revenue']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="#4a7c59"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}