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

  // FIXED: Use real data or zeros, never fake data
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // If we have actual monthly data, use it
    if (monthlyData && monthlyData.length > 0) {
      return monthlyData
    }
    
    // Otherwise, return zeros for all months (no fake data!)
    return months.map(monthName => ({
      month: monthName,
      enrollments: 0,
      revenue: 0,
      courses: courses?.length || 0
    }));
  }, [monthlyData, courses])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value)
  }

  // Check if we have any actual data
  const hasRealData = chartData.some(data => data.enrollments > 0 || data.revenue > 0)

  // If no real data and no courses, show empty state
  if (!hasRealData && (!courses || courses.length === 0)) {
    return (
      <div className="flex items-center justify-center h-full text-center text-muted-foreground p-6">
        <div>
          <TrendingUp className="mx-auto h-12 w-12 text-[#4a7c59] opacity-50 mb-4" />
          <p className="text-sm">No performance data available yet</p>
          <p className="text-xs text-[#5c6d5e] mt-1">
            Create your first course to see analytics here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Show message when charts have no real data */}
      {!hasRealData && courses && courses.length > 0 && (
        <div className="text-center text-sm text-muted-foreground mb-4">
          <p>Charts will populate as students enroll in your courses</p>
        </div>
      )}

      {/* Charts */}
      <div className="h-56 sm:h-72">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="enrollments" className="text-xs">Enrollments</TabsTrigger>
            <TabsTrigger value="revenue" className="text-xs">Revenue</TabsTrigger>
          </TabsList>

          <TabsContent value="enrollments" className="mt-2">
            <div className="h-48 sm:h-64 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 15, left: 5, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#666"
                    fontSize={9}
                    interval={0}
                    tick={{ fontSize: 9 }}
                    height={20}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={10}
                    width={30}
                    domain={[0, 'dataMax + 10']}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      fontSize: '12px'
                    }}
                    formatter={(value, name) => [value, 'Enrollments']}
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
                <BarChart data={chartData} margin={{ top: 5, right: 15, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#666"
                    fontSize={9}
                    interval={0}
                    tick={{ fontSize: 9 }}
                    height={20}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={10}
                    width={50}
                    tickFormatter={(value) => `$${value}`}
                    domain={[0, 'dataMax + 100']}
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
                    radius={[5, 5, 0, 0]}
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