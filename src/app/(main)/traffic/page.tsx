'use client';

import { useState, useEffect } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { Area, AreaChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Button } from '@/components/ui/button';

interface HourlyData {
  hour: string;
  views: number;
}

interface DailyData {
  day: string;
  views: number;
}

const chartConfig = {
  views: {
    label: 'Page Views',
    color: '#00AA6C',
  },
} satisfies ChartConfig;

export default function TrafficPage() {
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [viewType, setViewType] = useState<'hourly' | 'daily'>('hourly');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchTrafficData = async () => {
    setIsLoading(true);
    try {
      // Single API call for both
      const response = await fetch('/api/traffic?type=all');
      const data = await response.json();

      // Format hourly data
      const formattedHourly = (data.hourly || []).map((item: { hour: string; views: number }) => ({
        hour: new Date(item.hour).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
        views: Number(item.views),
      }));
      setHourlyData(formattedHourly);

      // Format daily data
      const formattedDaily = (data.daily || []).map((item: { day: string; views: number }) => ({
        day: new Date(item.day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        views: Number(item.views),
      }));
      setDailyData(formattedDaily);

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching traffic:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and polling every 30 seconds
  useEffect(() => {
    fetchTrafficData();
    const interval = setInterval(fetchTrafficData, 30000);
    return () => clearInterval(interval);
  }, []);

  const chartData = viewType === 'hourly' ? hourlyData : dailyData;
  const xDataKey = viewType === 'hourly' ? 'hour' : 'day';

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-[#092327] text-white py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-8 w-8 text-[#34E0A1]" />
            <h1 className="text-3xl font-bold">Live Traffic</h1>
          </div>
          <p className="text-gray-300">
            Real-time visitor activity across the Gems platform
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-[#092327]">Traffic Overview</h2>
              {lastUpdated && (
                <p className="text-xs text-gray-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewType('hourly')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewType === 'hourly'
                      ? 'bg-white text-[#092327] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  24 Hours
                </button>
                <button
                  onClick={() => setViewType('daily')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewType === 'daily'
                      ? 'bg-white text-[#092327] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  7 Days
                </button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchTrafficData}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {isLoading && chartData.length === 0 ? (
            <div className="h-[350px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">Loading traffic data...</p>
              </div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[350px] flex items-center justify-center">
              <div className="text-center">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No traffic data yet</p>
                <p className="text-sm text-gray-400">Data will appear as visitors browse the site</p>
              </div>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00AA6C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00AA6C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey={xDataKey}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  width={40}
                />
                <ChartTooltip
                  cursor={{ stroke: '#00AA6C', strokeWidth: 1, strokeDasharray: '4 4' }}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#00AA6C"
                  strokeWidth={2}
                  fill="url(#fillViews)"
                />
              </AreaChart>
            </ChartContainer>
          )}
        </div>

        {/* Live indicator */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00AA6C] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00AA6C]"></span>
          </span>
          <span>Live data</span>
        </div>
      </div>
    </div>
  );
}
