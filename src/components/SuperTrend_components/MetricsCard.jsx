/**
 * Metrics Card Component - Display backtest metrics
 */
import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const MetricsCard = ({ metrics }) => {
  if (!metrics) {
    return (
      <Card>
        <p className="text-gray-400 text-center">No metrics available</p>
      </Card>
    );
  }

  return (
    <Card title="Performance Metrics" className="shadow-lg">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Statistic
            title="Total Return"
            value={metrics.total_return}
            precision={2}
            valueStyle={{ 
              color: metrics.total_return >= 0 ? '#52c41a' : '#f5222d' 
            }}
            prefix={metrics.total_return >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            suffix="%"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Statistic
            title="CAGR"
            value={metrics.cagr}
            precision={2}
            valueStyle={{ 
              color: metrics.cagr >= 0 ? '#52c41a' : '#f5222d' 
            }}
            prefix={metrics.cagr >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            suffix="%"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Statistic
            title="Max Drawdown"
            value={Math.abs(metrics.max_drawdown)}
            precision={2}
            valueStyle={{ color: '#f5222d' }}
            prefix={<ArrowDownOutlined />}
            suffix="%"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Statistic
            title="Sharpe Ratio"
            value={metrics.sharpe_ratio}
            precision={2}
            valueStyle={{ 
              color: metrics.sharpe_ratio >= 1 ? '#52c41a' : '#faad14' 
            }}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Statistic
            title="Volatility"
            value={metrics.volatility}
            precision={2}
            suffix="%"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Statistic
            title="Win Rate"
            value={metrics.win_rate}
            precision={2}
            suffix="%"
            valueStyle={{ 
              color: metrics.win_rate >= 50 ? '#52c41a' : '#faad14' 
            }}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Statistic
            title="Total Trades"
            value={metrics.total_trades}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Statistic
            title="Final Value"
            value={formatCurrency(metrics.final_value)}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default MetricsCard;

