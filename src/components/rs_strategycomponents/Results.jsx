import React, { useState } from 'react';
import { 
  Table, 
  Row, 
  Col, 
  Button, 
  DatePicker, 
  Space,
  Skeleton
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/RScontext';
// Removed all Ant Design icons for pure 3D design
import dayjs from 'dayjs';

// Removed unused Typography destructuring
const { RangePicker } = DatePicker;

const Results = () => {
  const navigate = useNavigate();
  const { backtests, strategies, loading } = useApp();
  const [dateRange, setDateRange] = useState([dayjs().subtract(6, 'month'), dayjs()]);

  const columns = [
    {
      title: <span className="text-gray-800 font-bold">Strategy</span>,
      dataIndex: 'config_name',
      key: 'config_name',
      render: (text, record) => {
        const strategy = strategies.find(s => s.id === record.config_id);
        return (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:bg-gray-100 transition-all duration-300">
            <div className="font-semibold text-gray-800 text-lg mb-1">
              {strategy ? strategy.config_name : 'Unknown Strategy'}
            </div>
            <div className="text-sm text-gray-600">
              Strategy ID: {record.config_id}
            </div>
          </div>
        );
      },
    },
    {
      title: <span className="text-gray-800 font-bold">Period</span>,
      key: 'period',
      render: (_, record) => (
        <div className="bg-green-50 rounded-xl p-4 border border-green-200 hover:bg-green-100 transition-all duration-300">
          <div className="font-semibold text-green-700 text-lg mb-1">
            {dayjs(record.start_date).format('MMM YYYY')} - {dayjs(record.end_date).format('MMM YYYY')}
          </div>
          <div className="text-sm text-green-600">
            {dayjs(record.end_date).diff(dayjs(record.start_date), 'month')} months duration
          </div>
        </div>
      ),
    },
    {
      title: <span className="text-gray-800 font-bold">Return %</span>,
      dataIndex: 'total_return_pct',
      key: 'total_return_pct',
      render: (value, record) => (
        <div className={`backdrop-blur-sm rounded-xl p-4 border transition-all duration-300 ${
          value >= 0 
            ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 hover:border-green-400/40' 
            : 'bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/20 hover:border-red-400/40'
        }`}>
          <div className={`font-bold text-xl mb-1 ${value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {value ? value.toFixed(2) : 'N/A'}%
          </div>
          <div className="text-sm text-gray-300">
            {value ? (value / dayjs(record.end_date).diff(dayjs(record.start_date), 'year')).toFixed(1) : 'N/A'}% p.a.
          </div>
        </div>
      ),
    },
    {
      title: <span className="text-gray-800 font-bold">Risk Metrics</span>,
      key: 'risk',
      render: (_, record) => (
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200 hover:bg-orange-100 transition-all duration-300 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-orange-700 text-sm">Sharpe:</span>
            <span className={`font-semibold ${record.sharpe_ratio > 1 ? 'text-green-600' : record.sharpe_ratio > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
              {record.sharpe_ratio ? record.sharpe_ratio.toFixed(2) : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-red-700 text-sm">Max DD:</span>
            <span className="font-semibold text-red-600">
              {record.max_drawdown_pct ? record.max_drawdown_pct.toFixed(2) : 'N/A'}%
            </span>
          </div>
        </div>
      ),
    },
    {
      title: <span className="text-gray-800 font-bold">Performance</span>,
      key: 'performance',
      render: (_, record) => (
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 hover:bg-yellow-100 transition-all duration-300 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-yellow-700 text-sm">Trades:</span>
            <span className="font-semibold text-yellow-600">{record.total_trades}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-orange-700 text-sm">Win Rate:</span>
            <span className={`font-semibold ${record.win_rate_pct > 50 ? 'text-green-600' : 'text-red-600'}`}>
              {record.win_rate_pct ? record.win_rate_pct.toFixed(1) : 'N/A'}%
            </span>
          </div>
        </div>
      ),
    },
    {
      title: <span className="text-gray-800 font-bold">Date</span>,
      dataIndex: 'created_at',
      key: 'created_at',
      render: (value) => (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:bg-gray-100 transition-all duration-300">
          <div className="text-gray-800 font-semibold">{dayjs(value).format('DD MMM YYYY')}</div>
          <div className="text-gray-600 text-sm">{dayjs(value).format('HH:mm')}</div>
        </div>
      ),
    },
    {
      title: <span className="text-gray-800 font-bold">Actions</span>,
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            onClick={() => handleViewDetails(record)}
            className="bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30 hover:border-blue-400/50 hover:text-blue-300 rounded-lg"
          >
            👁️ View
          </Button>
          <Button 
            size="small" 
            className="bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30 hover:border-green-400/50 hover:text-green-300 rounded-lg"
          >
            📥 Export
          </Button>
        </Space>
      ),
    },
  ];

  const handleViewDetails = (backtest) => {
    // Navigate to full-screen detail page
    navigate(`/results/${backtest.id}`);
  };

  const filteredBacktests = backtests.filter(backtest => {
    const createdDate = dayjs(backtest.created_at);
    return createdDate.isAfter(dateRange[0]) && createdDate.isBefore(dateRange[1]);
  });

  const getOverallStats = () => {
    if (filteredBacktests.length === 0) return null;

    const returns = filteredBacktests.map(b => b.total_return_pct || 0);
    const sharpes = filteredBacktests.map(b => b.sharpe_ratio || 0);
    const drawdowns = filteredBacktests.map(b => Math.abs(b.max_drawdown_pct) || 0);

    return {
      avgReturn: returns.reduce((a, b) => a + b, 0) / returns.length,
      avgSharpe: sharpes.reduce((a, b) => a + b, 0) / sharpes.length,
      bestReturn: Math.max(...returns),
      worstDrawdown: Math.max(...drawdowns),
      totalBacktests: filteredBacktests.length,
    };
  };

  const stats = getOverallStats();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="relative z-10 space-y-8">
        {/* 3D Page Header */}
        <div className="flex justify-between items-center">
          <div className="transform hover:scale-105 transition-all duration-300">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Backtest Results
            </h1>
            <p className="text-lg text-gray-600 font-light">
              Analyze your strategy performance with <span className="text-blue-600 font-semibold">advanced analytics</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="MMM YYYY"
              className="bg-white/10 border-white/20 text-white rounded-xl"
            />
            <Button 
              className="h-10 px-4 bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400 rounded-lg"
            >
              📥 Export All
            </Button>
            <Button 
              type="primary" 
              className="h-10 px-4 bg-blue-600 border-0 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200"
            >
              📤 Share
            </Button>
          </div>
        </div>

        {loading ? (
          <>
            <Row gutter={[16, 16]}>
              {[1, 2, 3, 4].map(i => (
                <Col xs={24} sm={12} lg={6} key={i}>
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
                    <Skeleton active paragraph={{ rows: 2 }} />
                  </div>
                </Col>
              ))}
            </Row>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl">
              <Skeleton active paragraph={{ rows: 8 }} />
            </div>
          </>
        ) : backtests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 shadow-2xl">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <div className="text-8xl">📊</div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">No Backtest Results Yet</h3>
            <p className="text-gray-300 text-lg mb-8 max-w-md text-center">
              Run your first backtest to see <span className="text-blue-400 font-semibold">performance analytics</span> and insights
            </p>
            <Button 
              type="primary" 
              size="large" 
              href="/backtest"
              className="h-14 px-10 bg-gradient-to-r from-blue-600 to-cyan-600 border-0 rounded-2xl shadow-2xl hover:shadow-blue-500/25 hover:from-blue-500 hover:to-cyan-500 transform hover:-translate-y-1 transition-all duration-300"
            >
              <span className="text-lg font-semibold">Run Backtest</span>
            </Button>
          </div>
        ) : (
          <>
            {/* Overall Statistics */}
            {stats && (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
                  <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 transform hover:-translate-y-1 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        *
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-400">{stats.totalBacktests}</div>
                        <div className="text-sm text-blue-300">Total Backtests</div>
                      </div>
                    </div>
                  </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
                  <div className={`backdrop-blur-lg rounded-2xl p-6 border transition-all duration-300 transform hover:-translate-y-1 shadow-xl ${
                    stats.avgReturn >= 0 
                      ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 hover:border-green-400/50' 
                      : 'bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/30 hover:border-red-400/50'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        stats.avgReturn >= 0 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                          : 'bg-gradient-to-r from-red-500 to-pink-500'
                      }`}>
                        <div className="text-2xl">{stats.avgReturn >= 0 ? '📈' : '📉'}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${stats.avgReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stats.avgReturn.toFixed(2)}%
                        </div>
                        <div className={`text-sm ${stats.avgReturn >= 0 ? 'text-green-300' : 'text-red-300'}`}>Average Return</div>
                      </div>
                    </div>
                  </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
                  <div className={`backdrop-blur-lg rounded-2xl p-6 border transition-all duration-300 transform hover:-translate-y-1 shadow-xl ${
                    stats.avgSharpe > 1 
                      ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 hover:border-green-400/50' 
                      : stats.avgSharpe > 0 
                        ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30 hover:border-yellow-400/50'
                        : 'bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/30 hover:border-red-400/50'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        stats.avgSharpe > 1 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                          : stats.avgSharpe > 0 
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                            : 'bg-gradient-to-r from-red-500 to-pink-500'
                      }`}>
                        <div className="text-2xl">🛡️</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${
                          stats.avgSharpe > 1 ? 'text-green-400' : stats.avgSharpe > 0 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {stats.avgSharpe.toFixed(2)}
                        </div>
                        <div className={`text-sm ${
                          stats.avgSharpe > 1 ? 'text-green-300' : stats.avgSharpe > 0 ? 'text-yellow-300' : 'text-red-300'
                        }`}>Average Sharpe</div>
                      </div>
                    </div>
                  </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 transform hover:-translate-y-1 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <div className="text-2xl">🛡️</div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-purple-400">{stats.bestReturn.toFixed(2)}%</div>
                        <div className="text-sm text-purple-300">Best Return</div>
                      </div>
                    </div>
                  </div>
          </Col>
        </Row>
      )}

      {/* Results Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="text-2xl">📊</div>
                  Backtest Results
                  <span className="text-sm font-normal text-gray-600 bg-blue-100 px-3 py-1 rounded-full">
                    {filteredBacktests.length} Results
                  </span>
                </h2>
              </div>
              <div className="p-6">
        <Table
          columns={columns}
          dataSource={filteredBacktests}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
          rowClassName="hover:bg-gray-50"
                  className="results-table"
        />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Custom CSS for table styling */}
      <style jsx>{`
        .results-table .ant-table {
          background: transparent !important;
        }
        .results-table .ant-table-thead > tr > th {
          background: rgba(255, 255, 255, 0.05) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: white !important;
        }
        .results-table .ant-table-tbody > tr > td {
          background: transparent !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          padding: 16px !important;
        }
        .results-table .ant-table-tbody > tr:hover > td {
          background: rgba(255, 255, 255, 0.05) !important;
        }
        .results-table .ant-pagination {
          color: white !important;
        }
        .results-table .ant-pagination .ant-pagination-item {
          background: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
        }
        .results-table .ant-pagination .ant-pagination-item a {
          color: white !important;
        }
        .results-table .ant-pagination .ant-pagination-item-active {
          background: linear-gradient(135deg, #3b82f6, #06b6d4) !important;
          border-color: transparent !important;
        }
      `}</style>
    </div>
  );
};

export default Results;

