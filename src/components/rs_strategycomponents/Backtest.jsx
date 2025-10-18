import React, { useState } from 'react';
import { 
  Form, 
  Select, 
  DatePicker, 
  Button, 
  Row, 
  Col, 
  Alert, 
  Progress,
  message,
  Space,
  Typography,
  Skeleton
} from 'antd';
import { useApp } from '../../context/RScontext';
// Removed all Ant Design icons for pure 3D design
import dayjs from 'dayjs';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const Backtest = () => {
  const { strategies, loading, runBacktest } = useApp();
  const [form] = Form.useForm();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [backtestResult, setBacktestResult] = useState(null);
  const [error, setError] = useState(null);

  // No default dates - user must select custom dates

  const handleRunBacktest = async (values) => {
    setIsRunning(true);
    setProgress(0);
    setError(null);
    setBacktestResult(null);

    try {
      const { config_id, dateRange } = values;
      const [startDate, endDate] = dateRange;

      // Set initial progress - no need for polling
      setProgress(50);

      const result = await runBacktest({
        config_id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });

      // Set completion progress
      setProgress(100);

      if (result.results) {
        setBacktestResult(result.results);
        message.success('Backtest completed successfully!');
      } else {
        message.info('Backtest already exists or is in progress');
      }

    } catch (error) {
      setError(error.message || 'Backtest failed');
      message.error('Failed to run backtest');
    } finally {
      setIsRunning(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const [selectedStrategy, setSelectedStrategy] = useState(null);

  const handleStrategyChange = (configId) => {
    const strategy = strategies.find(s => s.id === configId);
    setSelectedStrategy(strategy);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="relative z-10 space-y-8">
        {/* Page Header */}
        <div className="transform transition-all duration-300">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Run Backtest
          </h1>
          <p className="text-lg text-gray-600 font-light">
            Test your RS strategy with <span className="text-blue-600 font-semibold">historical data analysis</span>
          </p>
        </div>

        {loading ? (
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                <Skeleton active paragraph={{ rows: 6 }} />
              </div>
            </Col>
            <Col xs={24} lg={12}>
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                <Skeleton active paragraph={{ rows: 6 }} />
              </div>
            </Col>
          </Row>
        ) : strategies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-200 shadow-lg">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <div className="text-8xl">🚀</div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No Strategies Available</h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md text-center">
              Please create a strategy first before running a <span className="text-blue-600 font-semibold">backtest analysis</span>
            </p>
            <Button 
              type="primary" 
              size="large" 
              href="/strategy-config"
              className="h-12 px-8 bg-blue-600 border-0 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200"
            >
              <span className="text-lg font-semibold">Go to Strategy Config</span>
            </Button>
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            {/* Configuration Form */}
            <Col xs={24} lg={12}>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden h-full">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="text-2xl">⚡</div>
                    Backtest Configuration
                  </h2>
                </div>
                <div className="p-6">
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleRunBacktest}
                    disabled={isRunning}
                    className="space-y-6"
                  >
                    <Form.Item
                      name="config_id"
                      label={<span className="text-gray-800 font-medium">Strategy Configuration</span>}
                      rules={[{ required: true, message: 'Please select a strategy' }]}
                    >
                      <Select
                        placeholder="Select strategy configuration"
                        size="large"
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        onChange={handleStrategyChange}
                        options={strategies.map(strategy => ({
                          value: strategy.id,
                          label: strategy.config_name,
                          strategy: strategy
                        }))}
                        className="h-12 text-gray-700"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.1)', 
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white'
                        }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="dateRange"
                      label={<span className="text-gray-800 font-medium">Backtest Period</span>}
                      rules={[{ required: true, message: 'Please select date range' }]}
                    >
                      <RangePicker
                        size="large"
                        className="w-full h-12 text-gray-700 bg-white/10 border-white/20 rounded-xl"
                        format="YYYY-MM-DD"
                        disabledDate={(current) => current && current > dayjs().endOf('day')}
                      />
                    </Form.Item>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        loading={isRunning}
                        className="w-full h-12 bg-blue-600 border-0 rounded-lg shadow-md hover:bg-blue-900 transition-all duration-200"
                      >
                        <span className="text-lg font-semibold">
                          {isRunning ? 'Running Backtest...' : 'Run Backtest'}
                        </span>
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              </div>
            </Col>

            {/* Strategy Details */}
            <Col xs={24} lg={12}>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden h-full">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="text-2xl">📊</div>
                    Selected Strategy Details
                  </h2>
                </div>
                <div className="p-6">
                  {selectedStrategy ? (
                    <div className="space-y-6">
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <Text className="text-xl font-bold text-blue-600">{selectedStrategy.config_name}</Text>
                        <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                            {selectedStrategy.main_index}
                          </span>
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                            {selectedStrategy.max_positions} positions
                          </span>
                        </div>
                      </div>

                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20 text-center">
                            <div className="text-2xl font-bold text-blue-400 mb-1">
                              ₹{(selectedStrategy.total_capital / 100000).toFixed(1)}L
                            </div>
                            <div className="text-sm text-blue-300">Total Capital</div>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/20 text-center">
                            <div className="text-2xl font-bold text-green-400 mb-1">
                              {selectedStrategy.position_size_pct}%
                            </div>
                            <div className="text-sm text-green-300">Position Size</div>
                          </div>
                        </Col>
                      </Row>

                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 space-y-3">
                        <div className="flex justify-between items-center">
                          <Text className="text-gray-300">Stop Loss:</Text>
                          <Text className="font-semibold text-red-400">{selectedStrategy.stop_loss_pct}%</Text>
                        </div>
                        <div className="flex justify-between items-center">
                          <Text className="text-gray-300">Buffer Capital:</Text>
                          <Text className="font-semibold text-orange-400">{selectedStrategy.buffer_capital_pct}%</Text>
                        </div>
                        <div className="flex justify-between items-center">
                          <Text className="text-gray-300">Transaction Cost:</Text>
                          <Text className="font-semibold text-purple-400">{selectedStrategy.transaction_cost_pct}%</Text>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-gray-500/10 to-slate-500/10 backdrop-blur-sm rounded-xl p-4 border border-gray-500/20">
                        <Text className="text-sm text-gray-300">
                          <strong className="text-white">Strategy Logic:</strong> Weekly rebalancing based on relative strength 
                          against {selectedStrategy.main_index}. Top {selectedStrategy.max_positions} stocks 
                          with positive RS scores are selected with {selectedStrategy.position_size_pct}% 
                          position size each.
                        </Text>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-slate-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                        <div className="text-6xl animate-pulse">📈</div>
                      </div>
                      <Text className="text-gray-600 text-lg">Select a strategy configuration to view details</Text>
                    </div>
                  )}
                </div>
              </div>
            </Col>
      </Row>
        )}

        {/* Progress and Results */}
        {isRunning && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="text-3xl animate-spin">⏳</div>
                Backtest Progress
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded-xl p-6 border border-emerald-500/20">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                      <div className="text-2xl animate-pulse">⚡</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-3">
                        <Text className="text-white font-semibold">Processing backtest...</Text>
                        <Text className="text-emerald-400 font-bold text-lg">{Math.round(progress)}%</Text>
                      </div>
                      <Progress 
                        percent={progress} 
                        status="active" 
                        strokeColor={{
                          '0%': '#10b981',
                          '100%': '#14b8a6',
                        }}
                        className="progress-3d"
                      />
                    </div>
                  </div>
                  <Alert
                    message="Backtest in Progress"
                    description="Please wait while we process your strategy against historical data. This may take a few minutes."
                    type="info"
                    showIcon
                    className="bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-red-500/20 shadow-2xl overflow-hidden">
            <div className="p-6">
              <Alert
                message="Backtest Failed"
                description={error}
                type="error"
                showIcon
                className="bg-red-500/10 border-red-500/20 text-red-300"
                action={
                  <Button 
                    size="small" 
                    danger 
                    onClick={() => setError(null)}
                    className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30 hover:border-red-400/50 hover:text-red-300 rounded-xl"
                  >
                    Dismiss
                  </Button>
                }
              />
            </div>
          </div>
        )}

        {/* Results Display */}
        {backtestResult && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="text-3xl">✅</div>
                Backtest Results
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} lg={6}>
                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 hover:border-green-400/50 transition-all duration-300 transform hover:-translate-y-1 shadow-xl text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <div className="text-2xl">📈</div>
                      </div>
                      <div className="text-3xl font-bold text-green-400 mb-2">
                        {backtestResult.total_return_pct?.toFixed(2)}%
                      </div>
                      <div className="text-sm text-green-300">Total Return</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 transform hover:-translate-y-1 shadow-xl text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <div className="text-2xl">📈</div>
                      </div>
                      <div className="text-3xl font-bold text-blue-400 mb-2">
                        {backtestResult.cagr_pct?.toFixed(2)}%
                      </div>
                      <div className="text-sm text-blue-300">CAGR</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-6 border border-indigo-500/30 hover:border-indigo-400/50 transition-all duration-300 transform hover:-translate-y-1 shadow-xl text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <div className="text-2xl">📈</div>
                      </div>
                      <div className="text-3xl font-bold text-indigo-400 mb-2">
                        {backtestResult.xirr_pct?.toFixed(2)}%
                      </div>
                      <div className="text-sm text-indigo-300">XIRR</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 transform hover:-translate-y-1 shadow-xl text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <div className="text-2xl">📈</div>
                      </div>
                      <div className="text-3xl font-bold text-orange-400 mb-2">
                        {backtestResult.sharpe_ratio?.toFixed(2)}
                      </div>
                      <div className="text-sm text-orange-300">Sharpe Ratio</div>
                    </div>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} lg={6}>
                    <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30 hover:border-red-400/50 transition-all duration-300 transform hover:-translate-y-1 shadow-xl text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <div className="text-2xl">📈</div>
                      </div>
                      <div className="text-3xl font-bold text-red-400 mb-2">
                        {backtestResult.max_drawdown_pct?.toFixed(2)}%
                      </div>
                      <div className="text-sm text-red-300">Max Drawdown</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 transform hover:-translate-y-1 shadow-xl text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <div className="text-2xl">📈</div>
                      </div>
                      <div className="text-3xl font-bold text-purple-400 mb-2">
                        {backtestResult.total_trades}
                      </div>
                      <div className="text-sm text-purple-300">Total Trades</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300 transform hover:-translate-y-1 shadow-xl text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <div className="text-2xl">📈</div>
                      </div>
                      <div className="text-3xl font-bold text-yellow-400 mb-2">
                        {backtestResult.win_rate_pct?.toFixed(1)}%
                      </div>
                      <div className="text-sm text-yellow-300">Win Rate</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <div className="bg-gradient-to-br from-gray-500/20 to-slate-500/20 backdrop-blur-sm rounded-2xl p-6 border border-gray-500/30 hover:border-gray-400/50 transition-all duration-300 transform hover:-translate-y-1 shadow-xl text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-slate-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <div className="text-2xl">📈</div>
                      </div>
                      <div className="text-3xl font-bold text-gray-400 mb-2">
                        ₹{(backtestResult.final_capital / 100000)?.toFixed(1)}L
                      </div>
                      <div className="text-sm text-gray-300">Final Capital</div>
                    </div>
                  </Col>
                </Row>

                <div className="text-center pt-6">
                  <Space size="large">
                    <Button 
                      type="primary" 
                      className="h-12 px-8 bg-gradient-to-r from-emerald-600 to-teal-600 border-0 rounded-xl shadow-lg hover:from-emerald-500 hover:to-teal-500 transform hover:-translate-y-1 transition-all duration-300"
                    >
                      <span className="font-semibold">View Detailed Results</span>
                    </Button>
                    <Button 
                      className="h-12 px-8 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 rounded-xl"
                    >
                      <span className="font-semibold">Export Results</span>
                    </Button>
                  </Space>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="text-2xl">💡</div>
              Backtesting Tips
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                <Text className="text-gray-600 text-base">
                  <strong className="text-gray-800">Time Period:</strong> Use at least 1-2 years of data for reliable results
                </Text>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                <Text className="text-gray-600 text-base">
                  <strong className="text-gray-800">Market Conditions:</strong> Test across different market cycles (bull, bear, sideways)
                </Text>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                <Text className="text-gray-600 text-base">
                  <strong className="text-gray-800">Transaction Costs:</strong> Ensure realistic transaction cost assumptions
                </Text>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                <Text className="text-gray-600 text-base">
                  <strong className="text-gray-800">Risk Management:</strong> Monitor drawdowns and adjust position sizes accordingly
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backtest;


