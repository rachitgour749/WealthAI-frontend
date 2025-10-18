import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  InputNumber, 
  Button, 
  Row, 
  Col, 
  Table, 
  Space, 
  Tag, 
  Modal, 
  message,
  Popconfirm,
  Divider,
  Select,
  Skeleton
} from 'antd';
import { useApp } from '../../context/RScontext';
// Removed all Ant Design icons for pure 3D design
import { STOCK_UNIVERSE_OPTIONS } from '../../utils/constants';

// Removed unused Typography destructuring

const StrategyConfig = () => {
  const { strategies, loading, createStrategy, updateStrategy, deleteStrategy } = useApp();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const handleCreateStrategy = async (values) => {
    try {
      await createStrategy(values);
      message.success('Strategy created successfully!');
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to create strategy');
    }
  };

  const handleEditStrategy = async (values) => {
    try {
      await updateStrategy(editingStrategy.id, values);
      message.success('Strategy updated successfully!');
      setIsEditModalVisible(false);
      setEditingStrategy(null);
      editForm.resetFields();
    } catch (error) {
      message.error('Failed to update strategy');
    }
  };

  const handleDeleteStrategy = async (id) => {
    try {
      await deleteStrategy(id);
      message.success('Strategy deleted successfully!');
    } catch (error) {
      message.error('Failed to delete strategy');
    }
  };

  const handleEdit = (strategy) => {
    setEditingStrategy(strategy);
    editForm.setFieldsValue(strategy);
    setIsEditModalVisible(true);
  };

  const handleCopy = (strategy) => {
    form.setFieldsValue({
      ...strategy,
      config_name: `${strategy.config_name} (Copy)`,
    });
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'Strategy Name',
      dataIndex: 'config_name',
      key: 'config_name',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">
            {record.stock_universe || 'NIFTY50'} • {record.main_index} • {record.max_positions} positions
          </div>
        </div>
      ),
    },
    {
      title: 'Capital',
      key: 'capital',
      render: (_, record) => (
        <div>
          <div className="font-medium">₹{(record.total_capital / 100000).toFixed(1)}L</div>
          <div className="text-sm text-gray-500">
            {record.position_size_pct}% per position
          </div>
        </div>
      ),
    },
    {
      title: 'Risk Management',
      key: 'risk',
      render: (_, record) => (
        <div className="space-y-1">
          <div className="text-sm">
            <span className="text-gray-500">SL: </span>
            <span className="font-medium">{record.stop_loss_pct}%</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Buffer: </span>
            <span className="font-medium">{record.buffer_capital_pct}%</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            onClick={() => handleEdit(record)}
            className="bg-blue-500/20 border-blue-400/30 text-blue-300 hover:bg-blue-500/30 hover:border-blue-400/50 rounded-lg"
          >
            ✏️ Edit
          </Button>
          <Button 
            size="small" 
            onClick={() => handleCopy(record)}
            className="bg-purple-500/20 border-purple-400/30 text-purple-300 hover:bg-purple-500/30 hover:border-purple-400/50 rounded-lg"
          >
            📋 Copy
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this strategy?"
            onConfirm={() => handleDeleteStrategy(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              size="small" 
              danger 
              className="bg-red-500/20 border-red-400/30 text-red-300 hover:bg-red-500/30 hover:border-red-400/50 rounded-lg"
            >
              🗑️ Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center border px-5">
          <div className="mt-3">
            <h1 className="text-2xl font-bold text-gray-800 ">Strategy Configuration</h1>
            <p className="text-gray-600">Manage your RS strategy parameters and settings</p>
          </div>
          <Button 
            type="primary" 
            size="large"
            onClick={() => setIsModalVisible(true)}
            className="bg-blue-600 border-0 shadow-md hover:bg-blue-700 transition-all duration-200 rounded-lg"
          >
            🤖 Create Strategy
          </Button>
        </div>

        {/* Strategy List */}
        {loading ? (
          <Card>
            <Skeleton active paragraph={{ rows: 8 }} />
          </Card>
        ) : strategies.length === 0 ? (
          <div className="empty-state">
            <div className="text-8xl mb-6">🤖</div>
            <h3>No Strategies Yet</h3>
            <p>Create your first trading strategy to get started with backtesting</p>
            <Button 
              type="primary" 
              size="large" 
              onClick={() => setIsModalVisible(true)}
              className="bg-blue-600 border-0 shadow-md hover:bg-blue-700 transition-all duration-200 rounded-lg"
            >
              🤖 Create Your First Strategy
            </Button>
          </div>
        ) : (
          <Card className="glass-card">
            <Table
              columns={columns}
              dataSource={strategies}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        )}

      {/* Create Strategy Modal */}
      <Modal
        title="Create New Strategy"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateStrategy}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="config_name"
                label="Strategy Name"
                rules={[{ required: true, message: 'Please enter strategy name' }]}
              >
                <Input placeholder="e.g., Conservative RS Strategy" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="main_index"
                label="Main Index"
                initialValue="^NSEI"
                rules={[{ required: true, message: 'Please enter main index' }]}
              >
                <Input placeholder="^NSEI (Nifty 50)" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="stock_universe"
                label="Stock Universe"
                initialValue="NIFTY500"
                rules={[{ required: true, message: 'Please select stock universe' }]}
              >
                <Select placeholder="Select stock universe">
                  {STOCK_UNIVERSE_OPTIONS.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label} ({option.description})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>


          <Divider orientation="left">Position Management</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="max_positions"
                label="Max Positions"
                initialValue={20}
                rules={[{ required: true, message: 'Please enter max positions' }]}
              >
                <InputNumber min={1} max={100} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="position_size_pct"
                label="Position Size (%)"
                initialValue={5.0}
                rules={[{ required: true, message: 'Please enter position size' }]}
              >
                <InputNumber min={0.1} max={20} step={0.1} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="total_capital"
                label="Total Capital (₹)"
                initialValue={1000000}
                rules={[{ required: true, message: 'Please enter total capital' }]}
              >
                <InputNumber min={100000} step={100000} className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Risk Management</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="stop_loss_pct"
                label="Stop Loss (%)"
                initialValue={15.0}
                rules={[{ required: true, message: 'Please enter stop loss' }]}
                extra="Enter 0 for no stop loss, 1-5% for conservative, 6-20% for standard, >20% for aggressive"
              >
                <InputNumber min={0} max={50} step={0.1} className="w-full" placeholder="Enter 0 for no stop loss" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="buffer_capital_pct"
                label="Buffer Capital (%)"
                initialValue={10.0}
                rules={[{ required: true, message: 'Please enter buffer capital' }]}
              >
                <InputNumber min={0} max={50} step={0.1} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="capital_reset_threshold_pct"
                label="Capital Reset Threshold (%)"
                initialValue={25.0}
                rules={[{ required: true, message: 'Please enter reset threshold' }]}
              >
                <InputNumber min={1} max={100} step={0.1} className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Additional Settings</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="max_holding_period"
                label="Max Holding Period (weeks)"
                initialValue={52}
                rules={[{ required: true, message: 'Please enter max holding period' }]}
              >
                <InputNumber min={1} max={260} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="transaction_cost_pct"
                label="Transaction Cost (%)"
                initialValue={0.1}
                rules={[{ required: true, message: 'Please enter transaction cost' }]}
              >
                <InputNumber min={0} max={2} step={0.01} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="min_price"
                label="Minimum Price (₹)"
                initialValue={10.0}
                rules={[{ required: true, message: 'Please enter minimum price' }]}
              >
                <InputNumber min={1} max={1000} step={1} className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end space-x-2 mt-6">
            <Button onClick={() => setIsModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Create Strategy
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Strategy Modal */}
      <Modal
        title="Edit Strategy"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingStrategy(null);
          editForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditStrategy}
        >
          {/* Same form fields as create modal */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="config_name"
                label="Strategy Name"
                rules={[{ required: true, message: 'Please enter strategy name' }]}
              >
                <Input placeholder="e.g., Conservative RS Strategy" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="main_index"
                label="Main Index"
                rules={[{ required: true, message: 'Please enter main index' }]}
              >
                <Input placeholder="^NSEI (Nifty 50)" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="stock_universe"
                label="Stock Universe"
                rules={[{ required: true, message: 'Please select stock universe' }]}
              >
                <Select placeholder="Select stock universe">
                  {STOCK_UNIVERSE_OPTIONS.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label} ({option.description})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>


          <Divider orientation="left">Position Management</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="max_positions"
                label="Max Positions"
                rules={[{ required: true, message: 'Please enter max positions' }]}
              >
                <InputNumber min={1} max={100} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="position_size_pct"
                label="Position Size (%)"
                rules={[{ required: true, message: 'Please enter position size' }]}
              >
                <InputNumber min={0.1} max={20} step={0.1} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="total_capital"
                label="Total Capital (₹)"
                rules={[{ required: true, message: 'Please enter total capital' }]}
              >
                <InputNumber min={100000} step={100000} className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Risk Management</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="stop_loss_pct"
                label="Stop Loss (%)"
                rules={[{ required: true, message: 'Please enter stop loss' }]}
                extra="Enter 0 for no stop loss, 1-5% for conservative, 6-20% for standard, >20% for aggressive"
              >
                <InputNumber min={0} max={50} step={0.1} className="w-full" placeholder="Enter 0 for no stop loss" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="buffer_capital_pct"
                label="Buffer Capital (%)"
                rules={[{ required: true, message: 'Please enter buffer capital' }]}
              >
                <InputNumber min={0} max={50} step={0.1} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="capital_reset_threshold_pct"
                label="Capital Reset Threshold (%)"
                rules={[{ required: true, message: 'Please enter reset threshold' }]}
              >
                <InputNumber min={1} max={100} step={0.1} className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Additional Settings</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="max_holding_period"
                label="Max Holding Period (weeks)"
                rules={[{ required: true, message: 'Please enter max holding period' }]}
              >
                <InputNumber min={1} max={260} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="transaction_cost_pct"
                label="Transaction Cost (%)"
                rules={[{ required: true, message: 'Please enter transaction cost' }]}
              >
                <InputNumber min={0} max={2} step={0.01} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="min_price"
                label="Minimum Price (₹)"
                rules={[{ required: true, message: 'Please enter minimum price' }]}
              >
                <InputNumber min={1} max={1000} step={1} className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="is_active"
                label="Status"
                valuePropName="checked"
              >
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Active Strategy</span>
                </div>
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end space-x-2 mt-6">
            <Button onClick={() => setIsEditModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Update Strategy
            </Button>
          </div>
        </Form>
      </Modal>
      </div>
    </div>
  );
};

export default StrategyConfig;


