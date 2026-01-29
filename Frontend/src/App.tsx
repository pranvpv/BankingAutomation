import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MetricsResponse {
  total: number;
}

interface AnomalyByCompany {
  company_name: string;
  anomaly_count: number;
}

interface SystemStatus {
  last_ingestion_time: string;
}

const TIME_RANGES = [
  { value: 'yesterday', label: 'Yesterday' },
  { value: '1week', label: '1 Week' },
  { value: '1month', label: '1 Month' },
  { value: '3months', label: '3 Months' },
  { value: '6months', label: '6 Months' },
  { value: '1year', label: '1 Year' }
];




const API_BASE_URL = '/api'; // Replace with your actual API base URL

const Dashboard: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('1month');
  
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [totalAnomalies, setTotalAnomalies] = useState<number>(0);
  const [lastIngestionTime, setLastIngestionTime] = useState<string>('');
  const [anomalyChartData, setAnomalyChartData] = useState<AnomalyByCompany[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch all data when company or time range changes
  useEffect(() => {
    fetchDashboardData();
  }, [selectedTimeRange]);


  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      await Promise.all([
        fetchTransactions(),
        fetchAnomalies(),
        
        fetchSystemStatus()
      ]);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
  const url = `/api/functions/transactions?time_range=${selectedTimeRange}`;
  console.log("Calling:", url);

  const response = await fetch(url);
  console.log("Status:", response.status);

  const text = await response.text();
  console.log("Raw response:", text);

  try {
    const data = JSON.parse(text);
    console.log("Parsed data:", data);
    setTotalTransactions(data.total_transactions);
  } catch (e) {
    console.error("JSON parse failed", e);
    setTotalTransactions(0);
  }
};



  const fetchAnomalies = async () => {
  const url = `/api/functions/anamoly?time_range=${selectedTimeRange}`;
  console.log("Calling:", url);

  const response = await fetch(url);
  console.log("Status:", response.status);

  const text = await response.text();
  console.log("Raw response:", text);

  try {
    const data = JSON.parse(text);
    console.log("Parsed data:", data);
    setTotalAnomalies(data.total_anamoly);
  } catch (e) {
    console.error("JSON parse failed", e);
    setTotalAnomalies(0);
  }
};

  const fetchSystemStatus = async () => {
  const url = `/api/functions/last_exec`;
  console.log("Calling:", url);

  const response = await fetch(url);
  console.log("Status:", response.status);

  const text = await response.text();
  console.log("Raw response:", text);

  try {
    const data = JSON.parse(text);
    console.log("Parsed data:", data);
    setLastIngestionTime(data.last_ingestion_time);
  } catch (e) {
    console.error("JSON parse failed", e);
    setLastIngestionTime("N/A");
  }
};

  const formatTimestamp = (timestamp: string): string => {
    if (!timestamp || timestamp === 'N/A') return 'N/A';
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const shouldShowChart = ['1month', '3months', '6months', '1year'].includes(selectedTimeRange);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Global Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Time Range Selector */}
            <div>
              <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700 mb-2">
                Time Range
              </label>
              <select
                id="timeRange"
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {TIME_RANGES.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              
              {/* Total Transactions Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {totalTransactions.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-blue-100 rounded-full p-3">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total Anomalies Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Anomalies</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {totalAnomalies.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-red-100 rounded-full p-3">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Latest Ingestion Time Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Latest Ingestion</p>
                    <p className="text-lg font-semibold text-gray-900 mt-2 break-words">
                      {formatTimestamp(lastIngestionTime)}
                    </p>
                  </div>
                  <div className="bg-green-100 rounded-full p-3">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            {shouldShowChart && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Anomalies by Company
                </h2>
                
                {anomalyChartData.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No data available for the selected time range
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={anomalyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="company_name" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="anomaly_count" 
                        fill="#3b82f6" 
                        name="Anomaly Count"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}

            {!shouldShowChart && (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-600">
                  Chart view is available for 1 Month, 3 Months, 6 Months, and 1 Year time ranges.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
