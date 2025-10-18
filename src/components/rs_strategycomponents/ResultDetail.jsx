import React, { useState, useEffect, useCallback } from 'react';
import { 
  Row, 
  Col, 
  Button, 
  Tag,
  Tabs,
  Table,
  Skeleton
} from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/RScontext';
import {
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';
// Removed all Ant Design icons for pure 3D design
import dayjs from 'dayjs';

// Removed unused Typography destructuring
const { TabPane } = Tabs;

const ResultDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { backtests, strategies, getBacktestDetails, getBacktestTrades, getBacktestPortfolio } = useApp();
  
  const [loading, setLoading] = useState(true);
  const [detailedResults, setDetailedResults] = useState(null);
  const [portfolioData, setPortfolioData] = useState([]);
  const [tradesData, setTradesData] = useState([]);
  const [selectedBacktest, setSelectedBacktest] = useState(null);

  const loadBacktestDetails = useCallback(async () => {
    setLoading(true);
    try {
      const backtest = backtests.find(b => b.id === parseInt(id));
      setSelectedBacktest(backtest);

      if (backtest) {
        const [details, trades, portfolio] = await Promise.all([
          getBacktestDetails(backtest.id),
          getBacktestTrades(backtest.id),
          getBacktestPortfolio(backtest.id)
        ]);

        setDetailedResults(details);
        setTradesData(trades);
        setPortfolioData(portfolio);
      }
    } catch (error) {
      console.error('Failed to load detailed results:', error);
    } finally {
      setLoading(false);
    }
  }, [id, backtests]); // Removed function dependencies to prevent infinite re-renders

  useEffect(() => {
    loadBacktestDetails();
  }, [loadBacktestDetails]);

  const getStrategyName = () => {
    if (!selectedBacktest) return 'Backtest';
    const strategy = strategies.find(s => s.id === selectedBacktest.config_id);
    return strategy ? strategy.config_name : 'Unknown Strategy';
  };

  const chartData = portfolioData.map(snapshot => ({
    date: dayjs(snapshot.date).format('MMM DD'),
    value: snapshot.total_value,
    drawdown: Math.abs(snapshot.drawdown_pct),
    pnl: snapshot.cumulative_pnl,
  }));

  if (loading) {
    return (
      <div className="page-container">
        <Skeleton active paragraph={{ rows: 12 }} />
      </div>
    );
  }

  if (!selectedBacktest || !detailedResults) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h3>Backtest Not Found</h3>
          <p>The requested backtest result could not be found.</p>
          <Button type="primary" onClick={() => navigate('/results')}>
            Back to Results
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 space-y-8">
        {/* 3D Page Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Button 
              onClick={() => navigate('/results')}
              size="large"
              className="h-14 px-6 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 rounded-xl"
            >
              ← Back to Results
            </Button>
            <div className="transform hover:scale-105 transition-all duration-300">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent mb-1">
                Detailed Results
              </h1>
              <p className="text-xl text-gray-300 font-light">
                {getStrategyName()} - <span className="text-indigo-400 font-semibold">Performance Analytics</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={loadBacktestDetails}
              className="h-12 px-6 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 rounded-xl"
            >
              🔄 Refresh
            </Button>
            <Button 
              className="h-12 px-6 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 rounded-xl"
            >
              🖨️ Print
            </Button>
            <Button 
              className="h-12 px-6 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 rounded-xl"
            >
              📥 Export PDF
            </Button>
            <Button 
              type="primary" 
              className="h-12 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 border-0 rounded-xl shadow-lg hover:from-indigo-500 hover:to-purple-500 transform hover:-translate-y-1 transition-all duration-300"
            >
              📤 Share
            </Button>
          </div>
        </div>

        {/* 3D Summary Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Backtest Summary</h2>
          <Row gutter={[24, 24]} align="middle">
            <Col span={6}>
              <div className="text-center transform hover:scale-105 transition-all duration-300">
                <div className="text-gray-300 text-sm mb-2">Period</div>
                <div className="text-white font-semibold text-lg">
                  {dayjs(selectedBacktest.start_date).format('MMM DD, YYYY')} - {dayjs(selectedBacktest.end_date).format('MMM DD, YYYY')}
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div className="text-center transform hover:scale-105 transition-all duration-300">
                <div className="text-gray-300 text-sm mb-2">Duration</div>
                <div className="text-white font-semibold text-lg">
                  {dayjs(selectedBacktest.end_date).diff(dayjs(selectedBacktest.start_date), 'month')} months
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div className="text-center transform hover:scale-105 transition-all duration-300">
                <div className="text-gray-300 text-sm mb-2">Status</div>
                <div className="mt-1">
                  <Tag 
                    color={selectedBacktest.status === 'completed' ? 'green' : 'blue'}
                    className="text-white font-semibold px-3 py-1 rounded-full"
                  >
                    {selectedBacktest.status}
                  </Tag>
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div className="text-center transform hover:scale-105 transition-all duration-300">
                <div className="text-gray-300 text-sm mb-2">Run Date</div>
                <div className="text-white font-semibold text-lg">
                  {dayjs(selectedBacktest.created_at).format('MMM DD, YYYY')}
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* 3D Performance Metrics */}
        <Row gutter={[24, 24]}>
          <Col xs={12} sm={8} lg={4}>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 text-center transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="text-6xl mb-4">🏆</div>
                <div className="text-4xl font-bold text-white mb-2">
                  {detailedResults.total_return_pct?.toFixed(2)}%
                </div>
                <div className="text-green-100 text-sm font-medium">Total Return</div>
              </div>
            </div>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-center transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="text-6xl mb-4">🏆</div>
                <div className="text-4xl font-bold text-white mb-2">
                  {detailedResults.cagr_pct?.toFixed(2)}%
                </div>
                <div className="text-blue-100 text-sm font-medium">CAGR</div>
              </div>
            </div>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-3xl p-6 text-center transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="text-6xl mb-4">🏆</div>
                <div className="text-4xl font-bold text-white mb-2">
                  {detailedResults.xirr_pct?.toFixed(2)}%
                </div>
                <div className="text-purple-100 text-sm font-medium">XIRR</div>
              </div>
            </div>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-6 text-center transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="text-6xl mb-4">🏆</div>
                <div className="text-4xl font-bold text-white mb-2">
                  {detailedResults.sharpe_ratio?.toFixed(2)}
                </div>
                <div className="text-orange-100 text-sm font-medium">Sharpe Ratio</div>
              </div>
            </div>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl p-6 text-center transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="text-6xl mb-4">🏆</div>
                <div className="text-4xl font-bold text-white mb-2">
                  {detailedResults.max_drawdown_pct?.toFixed(2)}%
                </div>
                <div className="text-teal-100 text-sm font-medium">Max Drawdown</div>
              </div>
            </div>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl p-6 text-center transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="text-6xl mb-4">🏆</div>
                <div className="text-4xl font-bold text-white mb-2">
                  {detailedResults.total_trades}
                </div>
                <div className="text-pink-100 text-sm font-medium">Total Trades</div>
              </div>
            </div>
          </Col>
        </Row>

        {/* 3D Analytics Dashboard */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Analytics Dashboard
          </h2>
          <Tabs 
            defaultActiveKey="portfolio" 
            size="large"
            className="glass-tabs"
            tabBarStyle={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '8px',
              marginBottom: '24px'
            }}
          >
            <TabPane 
              tab={
                <span className="text-white font-semibold flex items-center gap-2">
                  <div className="text-2xl">📊</div>
                  Portfolio Performance
                </span>
              } 
              key="portfolio"
            >
              {chartData.length > 0 ? (
                <div className="space-y-8">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-6 text-center">Portfolio Value Over Time</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#9ca3af"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="#9ca3af"
                          fontSize={12}
                        />
                        <RechartsTooltip 
                          contentStyle={{
                            background: 'rgba(30, 41, 59, 0.95)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            color: 'white'
                          }}
                        />
                        <Area
                          type="monotone" 
                          dataKey="value" 
                          stroke="#3b82f6" 
                          fill="url(#portfolioGradient)"
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-6 text-center">Drawdown Analysis</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={chartData}>
                        <defs>
                          <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#9ca3af"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="#9ca3af"
                          fontSize={12}
                        />
                        <RechartsTooltip 
                          contentStyle={{
                            background: 'rgba(30, 41, 59, 0.95)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            color: 'white'
                          }}
                        />
                        <Bar 
                          dataKey="drawdown" 
                          fill="url(#drawdownGradient)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📈</div>
                  <div className="text-white text-lg">No chart data available</div>
                </div>
              )}
            </TabPane>

            <TabPane 
              tab={
                <span className="text-white font-semibold flex items-center gap-2">
                  <div className="text-2xl">📋</div>
                  Trade History
                </span>
              } 
              key="trades"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <Table
                  dataSource={tradesData}
                  columns={[
                    {
                      title: <span className="text-white font-semibold">Date</span>,
                      dataIndex: 'date',
                      key: 'date',
                      render: (value) => <span className="text-gray-300">{dayjs(value).format('DD MMM YYYY')}</span>,
                    },
                    {
                      title: <span className="text-white font-semibold">Symbol</span>,
                      dataIndex: 'symbol',
                      key: 'symbol',
                      render: (text) => <strong className="text-white">{text}</strong>
                    },
                    {
                      title: <span className="text-white font-semibold">Action</span>,
                      dataIndex: 'action',
                      key: 'action',
                      render: (action) => (
                        <Tag 
                          color={action === 'BUY' ? 'green' : 'red'}
                          className="font-semibold px-3 py-1 rounded-full"
                        >
                          {action}
                        </Tag>
                      ),
                    },
                    {
                      title: <span className="text-white font-semibold">Quantity</span>,
                      dataIndex: 'quantity',
                      key: 'quantity',
                      render: (value) => <span className="text-gray-300">{value}</span>
                    },
                    {
                      title: <span className="text-white font-semibold">Price</span>,
                      dataIndex: 'price',
                      key: 'price',
                      render: (value) => <span className="text-gray-300">₹{value.toFixed(2)}</span>,
                    },
                    {
                      title: <span className="text-white font-semibold">Amount</span>,
                      dataIndex: 'amount',
                      key: 'amount',
                      render: (value) => <span className="text-gray-300">₹{value.toFixed(2)}</span>,
                    },
                    {
                      title: <span className="text-white font-semibold">Reason</span>,
                      dataIndex: 'reason',
                      key: 'reason',
                      render: (value) => <span className="text-gray-300">{value}</span>
                    },
                  ]}
                  size="middle"
                  pagination={{ 
                    pageSize: 20,
                    className: 'glass-pagination'
                  }}
                  className="glass-table"
                />
              </div>
            </TabPane>

            <TabPane 
              tab={
                <span className="text-white font-semibold flex items-center gap-2">
                  <div className="text-2xl">📊</div>
                  Analysis
                </span>
              } 
              key="analysis"
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-6 text-center">Performance Analysis</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-white/10 rounded-xl">
                        <span className="text-gray-300">CAGR</span>
                        <span className="font-bold text-xl text-green-400">
                          {detailedResults.cagr_pct?.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-white/10 rounded-xl">
                        <span className="text-gray-300">XIRR</span>
                        <span className="font-bold text-xl text-blue-400">
                          {detailedResults.xirr_pct?.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-white/10 rounded-xl">
                        <span className="text-gray-300">Win Rate</span>
                        <span className="font-bold text-xl text-white">
                          {detailedResults.win_rate_pct?.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-white/10 rounded-xl">
                        <span className="text-gray-300">Final Capital</span>
                        <span className="font-bold text-xl text-purple-400">
                          ₹{(detailedResults.final_capital / 100000)?.toFixed(1)}L
                        </span>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} lg={12}>
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-6 text-center">Risk Metrics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-white/10 rounded-xl">
                        <span className="text-gray-300">Max Drawdown</span>
                        <span className="font-bold text-xl text-red-400">
                          {detailedResults.max_drawdown_pct?.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-white/10 rounded-xl">
                        <span className="text-gray-300">Sharpe Ratio</span>
                        <span className={`font-bold text-xl ${detailedResults.sharpe_ratio > 1 ? 'text-green-400' : 'text-orange-400'}`}>
                          {detailedResults.sharpe_ratio?.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-white/10 rounded-xl">
                        <span className="text-gray-300">Total Trades</span>
                        <span className="font-bold text-xl text-white">
                          {detailedResults.total_trades}
                        </span>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ResultDetail;

// Custom CSS for 3D styling
const customStyles = `
  .glass-tabs .ant-tabs-tab {
    background: rgba(255, 255, 255, 0.1) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    border-radius: 12px !important;
    margin: 0 4px !important;
    color: white !important;
  }
  
  .glass-tabs .ant-tabs-tab-active {
    background: rgba(255, 255, 255, 0.2) !important;
    border-color: rgba(255, 255, 255, 0.4) !important;
  }
  
  .glass-tabs .ant-tabs-tab:hover {
    background: rgba(255, 255, 255, 0.15) !important;
  }
  
  .glass-tabs .ant-tabs-content-holder {
    background: transparent !important;
  }
  
  .glass-table .ant-table {
    background: transparent !important;
  }
  
  .glass-table .ant-table-thead > tr > th {
    background: rgba(255, 255, 255, 0.1) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
    color: white !important;
  }
  
  .glass-table .ant-table-tbody > tr > td {
    background: transparent !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
    color: white !important;
  }
  
  .glass-table .ant-table-tbody > tr:hover > td {
    background: rgba(255, 255, 255, 0.05) !important;
  }
  
  .glass-pagination .ant-pagination-item {
    background: rgba(255, 255, 255, 0.1) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
  }
  
  .glass-pagination .ant-pagination-item a {
    color: white !important;
  }
  
  .glass-pagination .ant-pagination-item-active {
    background: rgba(255, 255, 255, 0.2) !important;
    border-color: rgba(255, 255, 255, 0.4) !important;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);
}
