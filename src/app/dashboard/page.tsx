"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, AlertTriangle, CheckCircle, Droplets, Thermometer, Wind } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { time: '00:00', ph: 7.2, temp: 26.5, do: 6.8, ammonia: 0.02 },
  { time: '04:00', ph: 7.1, temp: 26.2, do: 6.5, ammonia: 0.03 },
  { time: '08:00', ph: 7.3, temp: 27.1, do: 7.0, ammonia: 0.02 },
  { time: '12:00', ph: 7.5, temp: 28.5, do: 7.2, ammonia: 0.01 },
  { time: '16:00', ph: 7.4, temp: 28.0, do: 7.1, ammonia: 0.02 },
  { time: '20:00', ph: 7.2, temp: 27.2, do: 6.7, ammonia: 0.03 },
  { time: '24:00', ph: 7.2, temp: 26.8, do: 6.6, ammonia: 0.02 },
]

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl flex-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pool Monitor Dashboard</h1>
          <p className="text-muted-foreground">Real-time telemetry and AI analytics for Pool A (Catfish).</p>
        </div>
        <div className="flex items-center gap-2 bg-card px-4 py-2 border rounded-full shadow-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium">System Online</span>
        </div>
      </div>

      {/* Sensor Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28.5°C</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <CheckCircle className="h-3 w-3 text-green-500 mr-1" /> Normal
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-cyan-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">pH Level</CardTitle>
            <Activity className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.5</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <CheckCircle className="h-3 w-3 text-green-500 mr-1" /> Optimal (Catfish: 6.5-8.0)
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dissolved Oxygen (DO)</CardTitle>
            <Wind className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.2 mg/L</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <CheckCircle className="h-3 w-3 text-green-500 mr-1" /> Good (&gt;5.0 mg/L)
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ammonia (NH3)</CardTitle>
            <Droplets className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">0.03 mg/L</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1 text-amber-500">
              <AlertTriangle className="h-3 w-3 mr-1" /> Warning (Approaches 0.05)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Water Quality Trends (24h)</CardTitle>
              <CardDescription>Historical data for Temperature, pH, and DO</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.2} />
                    <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Line type="monotone" dataKey="temp" name="Temp (°C)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="ph" name="pH" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="do" name="DO (mg/L)" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>AI Computer Vision Analytics</CardTitle>
              <CardDescription>Latest scan results from underwater cameras</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted min-h-32 rounded-lg flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-3xl font-bold text-primary">12,450</span>
                  <span className="text-sm text-muted-foreground">Estimated Fish Count</span>
                </div>
                <div className="bg-muted min-h-32 rounded-lg flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-3xl font-bold text-primary">125g</span>
                  <span className="text-sm text-muted-foreground">Avg. Weight / Fish</span>
                </div>
                <div className="bg-muted min-h-32 rounded-lg flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-3xl font-bold text-primary">Normal</span>
                  <span className="text-sm text-muted-foreground">Feeding Behavior</span>
                </div>
                <div className="bg-muted min-h-32 rounded-lg flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-3xl font-bold text-primary">45 Days</span>
                  <span className="text-sm text-muted-foreground">Est. time to Harvest</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications and Logs */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>System Notifications</CardTitle>
              <CardDescription>Recent alerts and actions taken</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 pb-4 border-b">
                  <div className="p-2 bg-amber-500/10 rounded-full text-amber-500">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Ammonia levels rising</h4>
                    <p className="text-xs text-muted-foreground">08:15 AM - Level detected at 0.03 mg/L.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 pb-4 border-b">
                  <div className="p-2 bg-blue-500/10 rounded-full text-blue-500">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Water pump activated</h4>
                    <p className="text-xs text-muted-foreground">08:16 AM - System auto-triggered water exchange to lower ammonia.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 pb-4 border-b">
                  <div className="p-2 bg-green-500/10 rounded-full text-green-500">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Morning Feeding Completed</h4>
                    <p className="text-xs text-muted-foreground">07:00 AM - Dispersed 5kg of feed.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-cyan-500/10 rounded-full text-cyan-500">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">AI Camera Scan</h4>
                    <p className="text-xs text-muted-foreground">06:00 AM - Growth rate at +2% compared to last week.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-primary-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button className="w-full bg-background/20 hover:bg-background/30 transition-colors rounded-md p-2 text-sm font-medium text-left flex justify-between items-center">
                Manual Feeding <span className="text-xl">→</span>
              </button>
              <button className="w-full bg-background/20 hover:bg-background/30 transition-colors rounded-md p-2 text-sm font-medium text-left flex justify-between items-center">
                Trigger Aerator <span className="text-xl">→</span>
              </button>
              <button className="w-full bg-background/20 hover:bg-background/30 transition-colors rounded-md p-2 text-sm font-medium text-left flex justify-between items-center">
                Start AI Scan <span className="text-xl">→</span>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
