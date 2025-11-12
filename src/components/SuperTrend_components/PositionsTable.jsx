/**
 * Positions Table Component
 */
import React from 'react';
import { Table, Tag } from 'antd';
import { formatCurrency, formatPercentage, getPnLClass } from '../../utils/formatters';

const PositionsTable = ({ positions, loading }) => {
  const columns = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 120,
      render: (symbol) => <span className="font-semibold">{symbol}</span>,
    },
    {
      title: 'Entry Date',
      dataIndex: 'entry_date',
      key: 'entry_date',
      width: 120,
    },
    {
      title: 'Entry Price',
      dataIndex: 'entry_price',
      key: 'entry_price',
      width: 120,
      align: 'right',
      render: (price) => `₹${price.toFixed(2)}`,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right',
    },
    {
      title: 'Current Price',
      dataIndex: 'current_price',
      key: 'current_price',
      width: 120,
      align: 'right',
      render: (price) => `₹${price.toFixed(2)}`,
    },
    {
      title: 'Current Value',
      dataIndex: 'current_value',
      key: 'current_value',
      width: 140,
      align: 'right',
      render: (value) => formatCurrency(value),
    },
    {
      title: 'P&L',
      dataIndex: 'pnl',
      key: 'pnl',
      width: 120,
      align: 'right',
      render: (pnl) => (
        <span className={getPnLClass(pnl)}>
          {formatCurrency(pnl)}
        </span>
      ),
    },
    {
      title: 'P&L %',
      dataIndex: 'pnl_pct',
      key: 'pnl_pct',
      width: 100,
      align: 'right',
      render: (pnl_pct) => (
        <span className={getPnLClass(pnl_pct)}>
          {formatPercentage(pnl_pct)}
        </span>
      ),
      sorter: (a, b) => a.pnl_pct - b.pnl_pct,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <Table
        columns={columns}
        dataSource={positions}
        loading={loading}
        rowKey="symbol"
        pagination={false}
        scroll={{ x: 1000 }}
      />
    </div>
  );
};

export default PositionsTable;

