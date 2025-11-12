import { useState, useEffect } from 'react'
import { useSubscription } from '../../context/SubscriptionContext'

const PaymentPopup = ({ isOpen, onClose }) => {
  const { isProductActive, isProductInTrial, getProductDaysRemaining } = useSubscription()
  const [isLoading, setIsLoading] = useState(true)
  const [currentPlan, setCurrentPlan] = useState('MarketAI')


  // Function to get the correct plan file based on selection
  const getPlanFile = (plan) => {
    switch (plan) {
      case 'ChatAI':
        return '/templates/ChatAi_Plan.html'
      case 'MarketAI':
        return '/templates/MarketAI_Plan.html'
      case 'AutomationAI':
        return '/templates/AutomationAI_Plan.html'
      case 'TradeAI':
        return '/templates/TradAI_Plan.html'
      case 'WealthAI_Combo':
        return '/templates/WealthAI_Plan.html'
      default:
        return '/templates/MarketAI_Plan.html' // Default to Market AI
    }
  }

  // Function to get the plan title
  const getPlanTitle = (plan) => {
    switch (plan) {
      case 'ChatAI':
        return 'Chat AI Payment Plans'
      case 'MarketAI':
        return 'Market AI Payment Plans'
      case 'AutomationAI':
        return 'Automation AI Payment Plans'
      case 'TradeAI':
        return 'Trade AI Payment Plans'
      case 'WealthAI_Combo':
        return 'WealthAI Combos Payment Plans'
      default:
        return 'AI Payment Plans'
    }
  }

  // Function to handle plan change
  const handlePlanChange = (plan) => {
    console.log('Changing plan to:', plan)
    
    // Simply switch to the selected plan without checking for trial
    setCurrentPlan(plan)
    setIsLoading(true)
    // Fallback timeout in case iframe doesn't load
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }

  // Function to handle iframe load
  const handleIframeLoad = () => {
    console.log('Iframe loaded successfully for plan:', currentPlan)
    setIsLoading(false)
  }

  // Function to handle iframe error
  const handleIframeError = () => {
    console.error('Iframe failed to load for plan:', currentPlan)
    setIsLoading(false)
  }


  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      // Simulate loading time
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Prevent background page scroll while popup is open
  useEffect(() => {
    if (isOpen) {
      const previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = previousOverflow
      }
    }
  }, [isOpen])

  if (!isOpen) return null

    return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 animate-in fade-in duration-300" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      
      {/* Modal */}
      <div className="relative z-50 bg-white rounded-2xl shadow-2xl w-[900px] h-[550px] mt-[-50px] overflow-hidden animate-in zoom-in-95 duration-300" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-800 to-teal-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">WealthAI Plans</h2>
              
            </div>
            
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold transition-colors"
            >
              ×
            </button>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between w-[580px] mt-[-5px]">
          <button
              onClick={() => handlePlanChange('TradeAI')}
              className={`text-[12px] font-semibold h-[25px] w-[100px] rounded-[5px] transition-all duration-300 ${
                currentPlan === 'TradeAI'
                  ? 'bg-white text-orange-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Trade AI
            </button>
            {/* <button
              onClick={() => handlePlanChange('ChatAI')}
              className={`text-[12px] font-semibold h-[25px] w-[100px] rounded-[5px] transition-all duration-300 ${
                currentPlan === 'ChatAI'
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Chat AI
            </button> */}
            <button
              onClick={() => handlePlanChange('MarketAI')}
              className={`text-[12px] font-semibold h-[25px] w-[100px] rounded-[5px] transition-all duration-300  ${
                currentPlan === 'MarketAI'
                  ? 'bg-white text-green-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Market AI
            </button>
            <button
              onClick={() => handlePlanChange('AutomationAI')}
              className={`text-[12px] font-semibold h-[25px] w-[140px] rounded-[5px] transition-all duration-300 ${
                currentPlan === 'AutomationAI'
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Automation AI
            </button>
            
            <button
              onClick={() => handlePlanChange('WealthAI_Combo')}
              className={`text-[12px] font-semibold h-[25px] w-[200px] rounded-[5px] transition-all duration-300 ${
                currentPlan === 'WealthAI_Combo'
                  ? 'bg-white text-yellow-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              WealthAI Combos
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="h-full h-[470px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading payment options...</p>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <iframe
                src={getPlanFile(currentPlan)}
                className="w-full h-full"
                title={getPlanTitle(currentPlan)}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              />
            </div>
          )}
        </div>
      </div>
        </div>
    )
}

export default PaymentPopup
