/**
 * Main App Component
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { IoMdInformationCircleOutline } from 'react-icons/io';
import { MdOutlineSaveAlt } from 'react-icons/md';
// import Dashboard from '../components/SuperTrend_components/Dashboard';
import Backtest from '../components/SuperTrend_components/Backtest';
import { checkHealth, getDataAvailability } from '../context/SuperTrendapi/endpoints';
import '../components/SuperTrend_components/index.css';

const { Header, Sider, Content } = Layout;

function SuperTrend() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataStats, setDataStats] = useState(null);
  const [currentView, setCurrentView] = useState('backtest');
  const [isBacktestRunning, setIsBacktestRunning] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check API health
      const health = await checkHealth();
      console.log('API Status:', health);

      // Get data availability
      const stats = await getDataAvailability();
      setDataStats(stats);

      if (stats.stock_records === 0) {
        message.warning('No stock data found in database. Please load data first.');
      }
    } catch (error) {
      message.error('Failed to connect to backend API');
      console.error(error);
    } finally {
      // setLoading(false);
    }
  };

 
  const renderContent = useMemo(() => {
    const backtestProps = {
      onRunningStateChange: setIsBacktestRunning,
      onSaveStrategy: () => message.info('Save strategy feature coming soon'),
    };

    switch (currentView) {
      case 'backtest':
        return <Backtest {...backtestProps} />;
      default:
        return <Backtest {...backtestProps} />;
    }
  }, [currentView]);

  

  return (
    <Layout className="min-h-screen">

      <Layout>
        <Header className="bg-transparent shadow-none px-0 py-0 mt-4">
          <div className="w-full flex justify-center mt-4">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-[10px] shadow-lg w-full max-w-[1250px] overflow-hidden">
              <div className="flex relative items-center justify-between">
                <button
                  onClick={() => navigate(-1)}
                  className="p-[2px] rounded-[8px] flex shadow-md bg-white/10 border border-white/20 font-semibold items-center justify-center text-white text-[13px] transition-all duration-300 transform hover:scale-105 hover:bg-white/30"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Strategies
                </button>

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
                  <h1 className="text-[20px] font-bold text-white mb-[-1px]">SuperTrend Strategy</h1>
                  <button
                    onClick={() => {
                      if (!isBacktestRunning) {
                        message.info('Strategy details coming soon');
                      }
                    }}
                    disabled={isBacktestRunning}
                    className={`flex items-center justify-center text-white transition-all duration-300 hover:scale-110 ${
                      isBacktestRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    title={isBacktestRunning ? 'Backtest is running. Please wait...' : 'View Strategy Details'}
                  >
                    <IoMdInformationCircleOutline className="w-5 h-5 mt-[7px]" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (!isBacktestRunning) {
                      message.info('Strategy instances coming soon');
                    }
                  }}
                  disabled={isBacktestRunning}
                  className={`px-2 py-[-7px] rounded-[8px] flex shadow-md bg-white/20 backdrop-blur-sm font-semibold items-center justify-center text-white text-[13px] transition-all duration-300 transform hover:scale-105 hover:bg-white/30 ${
                    isBacktestRunning ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title={isBacktestRunning ? 'Backtest is running. Please wait...' : 'View Strategy Instances'}
                >
                  <MdOutlineSaveAlt className="w-4 h-4 mr-2 mt-[-1px]" />
                  Strategy Instances
                </button>
              </div>
            </div>
          </div>
        </Header>

        <Content className="px-0 pt-10">{renderContent}</Content>
      </Layout>
    </Layout>
  );
}

export default SuperTrend;

