/**
 * Configuration Panel Component
 */
import React, { useState, useEffect } from 'react';
import { Card, Form, InputNumber, Button, message, Spin } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { getConfig, updateConfig } from '../../context/SuperTrendapi/endpoints';
import { validateConfig } from '../../utils/validators';

const ConfigPanel = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const config = await getConfig();
      form.setFieldsValue(config);
    } catch (error) {
      message.error('Failed to load configuration');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      // Validate config
      const errors = validateConfig(values);
      if (errors.length > 0) {
        message.error(errors[0]);
        return;
      }

      setSaving(true);
      await updateConfig(values);
      message.success('Configuration saved successfully');
    } catch (error) {
      message.error('Failed to save configuration');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    loadConfig();
    message.info('Configuration reset to saved values');
  };

  if (loading) {
    return (
      <Card className="h-full">
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title="Strategy Configuration" 
      className="h-full"
      extra={
        <div className="flex gap-2">
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            Reset
          </Button>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleSave}
            loading={saving}
          >
            Save
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        className="max-w-2xl"
      >
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="EMA Short"
            name="ema_short"
            rules={[{ required: true, message: 'Required' }]}
          >
            <InputNumber className="w-full" min={1} max={100} />
          </Form.Item>

          <Form.Item
            label="EMA Long"
            name="ema_long"
            rules={[{ required: true, message: 'Required' }]}
          >
            <InputNumber className="w-full" min={1} max={200} />
          </Form.Item>

          <Form.Item
            label="Supertrend Period"
            name="supertrend_period"
            rules={[{ required: true, message: 'Required' }]}
          >
            <InputNumber className="w-full" min={1} max={50} />
          </Form.Item>

          <Form.Item
            label="Supertrend Stop %"
            name="supertrend_stop_pct"
            rules={[{ required: true, message: 'Required' }]}
          >
            <InputNumber className="w-full" min={1} max={50} step={0.1} />
          </Form.Item>

          <Form.Item
            label="Max Holdings"
            name="max_holdings"
            rules={[{ required: true, message: 'Required' }]}
          >
            <InputNumber className="w-full" min={1} max={20} />
          </Form.Item>

          <Form.Item
            label="Buffer Reserve (%)"
            name="buffer_pct"
            rules={[{ required: true, message: 'Required' }]}
            tooltip="Capital kept as reserve for P&L absorption"
          >
            <InputNumber className="w-full" min={0} max={30} step={1} />
          </Form.Item>

          <Form.Item
            label="Price Floor (₹)"
            name="price_floor"
            rules={[{ required: true, message: 'Required' }]}
          >
            <InputNumber className="w-full" min={1} max={10000} />
          </Form.Item>

          <Form.Item
            label="Liquidity (Cr)"
            name="liquidity_cr"
            rules={[{ required: true, message: 'Required' }]}
          >
            <InputNumber className="w-full" min={0.1} max={1000} step={0.1} />
          </Form.Item>

          <Form.Item
            label="RS Window 1 (Days)"
            name="rs_window_1"
            rules={[{ required: true, message: 'Required' }]}
          >
            <InputNumber className="w-full" min={1} max={30} />
          </Form.Item>

          <Form.Item
            label="RS Window 2 (Days)"
            name="rs_window_2"
            rules={[{ required: true, message: 'Required' }]}
          >
            <InputNumber className="w-full" min={1} max={60} />
          </Form.Item>

          <Form.Item
            label="RS Window 3 (Days)"
            name="rs_window_3"
            rules={[{ required: true, message: 'Required' }]}
          >
            <InputNumber className="w-full" min={1} max={252} />
          </Form.Item>
        </div>
      </Form>
    </Card>
  );
};

export default ConfigPanel;

