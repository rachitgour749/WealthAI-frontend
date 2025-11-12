/**
 * Run EOD Button Component
 */
import React, { useState } from 'react';
import { Button, message } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import { runEOD } from '../../context/SuperTrendapi/endpoints';

const RunEODButton = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleRunEOD = async () => {
    setLoading(true);
    try {
      const result = await runEOD();
      message.success(result.message);
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      message.error('Failed to run EOD processing');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="primary"
      size="large"
      icon={<PlayCircleOutlined />}
      onClick={handleRunEOD}
      loading={loading}
    >
      Run EOD Analysis
    </Button>
  );
};

export default RunEODButton;

