/**
 * Candidates Table Component
 */
import React from 'react';
import { Table, Tag } from 'antd';
import { formatNumber, formatPercentage } from '../../utils/formatters';

const CandidatesTable = ({ candidates, loading }) => {
  const columns = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank) => <Tag color="blue">{rank}</Tag>,
    },
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 120,
      render: (symbol) => <span className="font-semibold">{symbol}</span>,
    },
    {
      title: 'Price',
      dataIndex: 'adj_close',
      key: 'adj_close',
      width: 100,
      align: 'right',
      render: (price) => `₹${formatNumber(price)}`,
    },
    {
      title: 'EMA 10',
      dataIndex: 'ema10',
      key: 'ema10',
      width: 100,
      align: 'right',
      render: (ema) => formatNumber(ema),
    },
    {
      title: 'EMA 20',
      dataIndex: 'ema20',
      key: 'ema20',
      width: 100,
      align: 'right',
      render: (ema) => formatNumber(ema),
    },
    {
      title: 'Supertrend',
      dataIndex: 'supertrend',
      key: 'supertrend',
      width: 120,
      align: 'center',
      render: (st) => (
        <Tag color={st === 'green' ? 'success' : 'error'}>
          {st.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'RS Score',
      dataIndex: 'rs_score',
      key: 'rs_score',
      width: 120,
      align: 'right',
      render: (rs) => (
        <span className={rs > 0 ? 'text-green-600' : 'text-red-600'}>
          {formatPercentage(rs)}
        </span>
      ),
      sorter: (a, b) => a.rs_score - b.rs_score,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 120,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <Table
        columns={columns}
        dataSource={candidates}
        loading={loading}
        rowKey="symbol"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} candidates`,
        }}
        scroll={{ x: 1000 }}
      />
    </div>
  );
};

export default CandidatesTable;

