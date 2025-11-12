/**
 * Cost Tab Component - Display comprehensive cost analysis
 */
import React from 'react';
import { Card, Row, Col, Statistic, Progress, Table } from 'antd';
import { DollarOutlined, PercentageOutlined, ArrowDownOutlined, InfoCircleOutlined } from '@ant-design/icons';

const CostTab = ({ costData, trades }) => {
  if (!costData) {
    return (
      <Card>
        <p className="text-gray-400 text-center">No cost data available</p>
      </Card>
    );
  }

  const costBreakdownColumns = [
    {
      title: 'Cost Component',
      dataIndex: 'component',
      key: 'component',
      render: (text, record) => (
        <div className="flex items-center">
          <span className="font-medium">{text}</span>
          {record.description && (
            <InfoCircleOutlined 
              className="ml-2 text-gray-400" 
              title={record.description}
            />
          )}
        </div>
      ),
    },
    {
      title: 'Amount (₹)',
      dataIndex: 'amount',
      key: 'amount',
      render: (value) => `₹${value.toLocaleString('en-IN')}`,
      align: 'right',
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (value) => `${value.toFixed(2)}%`,
      align: 'right',
    },
  ];

  const costBreakdownData = [
    {
      key: 'brokerage',
      component: 'Brokerage',
      amount: costData.cost_breakdown.brokerage,
      percentage: (costData.cost_breakdown.brokerage / costData.cost_summary.total_transaction_costs) * 100,
      description: 'User-defined brokerage charges'
    },
    {
      key: 'stt',
      component: 'STT (Sell)',
      amount: costData.cost_breakdown.stt,
      percentage: (costData.cost_breakdown.stt / costData.cost_summary.total_transaction_costs) * 100,
      description: 'Securities Transaction Tax - 0.001% on sell transactions'
    },
    {
      key: 'stamp_duty',
      component: 'Stamp Duty (Buy)',
      amount: costData.cost_breakdown.stamp_duty,
      percentage: (costData.cost_breakdown.stamp_duty / costData.cost_summary.total_transaction_costs) * 100,
      description: 'Stamp duty - 0.005% on buy transactions'
    },
    {
      key: 'exchange',
      component: 'Exchange Charges',
      amount: costData.cost_breakdown.exchange_charges,
      percentage: (costData.cost_breakdown.exchange_charges / costData.cost_summary.total_transaction_costs) * 100,
      description: 'Exchange transaction charges - 0.00345%'
    },
    {
      key: 'sebi',
      component: 'SEBI Charges',
      amount: costData.cost_breakdown.sebi_charges,
      percentage: (costData.cost_breakdown.sebi_charges / costData.cost_summary.total_transaction_costs) * 100,
      description: 'SEBI regulatory charges - 0.0001%'
    },
    {
      key: 'gst',
      component: 'GST',
      amount: costData.cost_breakdown.gst,
      percentage: (costData.cost_breakdown.gst / costData.cost_summary.total_transaction_costs) * 100,
      description: 'Goods and Services Tax - 18% on brokerage'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cost Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="h-full">
            <Statistic
              title="Total Transaction Costs"
              value={costData.cost_summary.total_transaction_costs}
              valueStyle={{ color: '#f5222d' }}
              prefix={<DollarOutlined />}
              formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="h-full">
            <Statistic
              title="Cost Impact on Returns"
              value={Math.abs(costData.cost_summary.cost_impact_on_returns)}
              valueStyle={{ color: '#f5222d' }}
              prefix={<ArrowDownOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="h-full">
            <Statistic
              title="Avg Cost per Trade"
              value={costData.cost_summary.average_cost_per_trade}
              valueStyle={{ color: '#faad14' }}
              prefix={<DollarOutlined />}
              formatter={(value) => `₹${value.toFixed(2)}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="h-full">
            <Statistic
              title="Cost as % of Portfolio"
              value={costData.cost_summary.cost_percentage}
              valueStyle={{ color: '#faad14' }}
              prefix={<PercentageOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* Cost Breakdown Table */}
      <Card title="Cost Breakdown" className="shadow-lg">
        <Table
          columns={costBreakdownColumns}
          dataSource={costBreakdownData}
          pagination={false}
          size="small"
          className="cost-breakdown-table"
        />
      </Card>

      {/* Cost Analysis */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card title="Buy vs Sell Costs" className="h-full">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Buy Costs</span>
                  <span className="font-semibold text-green-600">
                    ₹{costData.cost_analysis.buy_costs.toLocaleString('en-IN')}
                  </span>
                </div>
                <Progress 
                  percent={(costData.cost_analysis.buy_costs / costData.cost_summary.total_transaction_costs) * 100}
                  strokeColor="#52c41a"
                  showInfo={false}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Avg: ₹{costData.cost_analysis.cost_per_buy.toFixed(2)} per trade
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Sell Costs</span>
                  <span className="font-semibold text-red-600">
                    ₹{costData.cost_analysis.sell_costs.toLocaleString('en-IN')}
                  </span>
                </div>
                <Progress 
                  percent={(costData.cost_analysis.sell_costs / costData.cost_summary.total_transaction_costs) * 100}
                  strokeColor="#f5222d"
                  showInfo={false}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Avg: ₹{costData.cost_analysis.cost_per_sell.toFixed(2)} per trade
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card title="Cost Statistics" className="h-full">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Highest Cost Trade:</span>
                <span className="font-semibold text-red-600">
                  ₹{costData.cost_analysis.highest_cost_trade.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Lowest Cost Trade:</span>
                <span className="font-semibold text-green-600">
                  ₹{costData.cost_analysis.lowest_cost_trade.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Buy Cost:</span>
                <span className="font-semibold">
                  ₹{costData.cost_analysis.cost_per_buy.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Sell Cost:</span>
                <span className="font-semibold">
                  ₹{costData.cost_analysis.cost_per_sell.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Trades:</span>
                <span className="font-semibold">
                  {trades ? trades.length : 0}
                </span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Cost Impact Analysis */}
      <Card title="Cost Impact Analysis" className="shadow-lg">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                ₹{costData.cost_summary.total_transaction_costs.toLocaleString('en-IN')}
              </div>
              <div className="text-sm text-gray-600">Total Costs Paid</div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {costData.cost_summary.cost_percentage.toFixed(2)}%
              </div>
              <div className="text-sm text-gray-600">of Initial Capital</div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {costData.cost_summary.average_cost_per_trade.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Avg Cost per Trade</div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default CostTab;
