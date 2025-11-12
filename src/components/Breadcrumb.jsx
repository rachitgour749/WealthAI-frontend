import React from 'react';

const Breadcrumb = ({ breadcrumbPath, onNavigate }) => {
  // Filter out tradeai1 from breadcrumb since it opens in a new tab
  const filteredPath = breadcrumbPath ? breadcrumbPath.filter(page => page !== 'tradeai1') : [];
  
  // Don't show breadcrumb if user is on home page or path is empty
  if (!filteredPath || filteredPath.length <= 1) {
    return null;
  }

  const getPageDisplayName = (page) => {
    const pageNames = {
      'home': 'Home',
      'marketsai1-app': 'MarketsAI',
      'etf-strategy': 'ETF Rotation Strategy',
      'stock-strategy': 'Stock Rotation Strategy',
      'RS-strategy': 'RS Strategy',
      'results': 'Results',
      'backtest': 'Backtest',
      'config': 'Configuration',
      'chatai1': 'ChatAI1',
      'papertraderai1': 'PaperTraderAI1',
      'scanai1': 'ScanAI1',
      'automationai': 'AutomationAI',
      'products': 'Products',
      'services': 'Services',
      'founders': 'About Us',
      'insights': 'Insights',
      'contact': 'Contact',
      'profile': 'Profile',
    };
    return pageNames[page] || page;
  };

  const handleBreadcrumbClick = (page, index) => {
    console.log('Breadcrumb clicked:', page, 'Index:', index, 'Path length:', filteredPath.length);
    console.log('Full breadcrumb path:', filteredPath);
    console.log('onNavigate function exists:', !!onNavigate);
    
    // Don't allow clicking on the last item (current page)
    if (index === filteredPath.length - 1) {
      console.log('Cannot click on current page');
      return;
    }
    
    if (onNavigate) {
      // Normalize MarketsAI breadcrumb to always go to the app page
      const normalizedPage = (page === 'marketsai1' || page === 'marketsai1-app')
        ? 'marketsai1-app'
        : page;
      console.log('Calling onNavigate with:', normalizedPage);
      console.log('About to call onNavigate function...');
      onNavigate(normalizedPage);
      console.log('onNavigate function called successfully');
    } else {
      console.log('onNavigate function not provided');
    }
  };

  return (
    <div className="bg-transpirant px-6 py-1">
      <div className="max-w-7xl mx-auto">
        <nav className="flex items-center space-x-1 text-sm">
          {filteredPath.map((page, index) => (
            <React.Fragment key={page}>
              {index > 0 && (
                <span className="text-gray-500 mx-2 font-normal">›</span>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleBreadcrumbClick(page, index);
                }}
                className={`${
                  index === filteredPath.length - 1
                    ? 'text-gray-900 font-medium cursor-default'
                    : 'text-gray-600 hover:text-gray-900 hover:underline cursor-pointer'
                } transition-colors duration-200 px-1 py-0.5 rounded`}
                disabled={index === filteredPath.length - 1}
                type="button"
              >
                {getPageDisplayName(page)}
              </button>
            </React.Fragment>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumb;
