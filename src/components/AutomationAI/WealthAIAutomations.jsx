import React, { useState, useEffect } from 'react';
import './WealthAIAutomations.css'; // Import the CSS separately or use styled-components
import AutomationAI from '../../Assets/AutomationAI.png';
import AutomationAI1Logo from '../../Assets/AutomationAI1Logo.png';
import Whatsapp from '../SocialmediaIcon/Whatsapp';


const WealthAIAutomations = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [expandedAccordions, setExpandedAccordions] = useState({});

  // Modal management
  const openModal = (modalId) => {
    setActiveModal(modalId);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setActiveModal(null);
    document.body.style.overflow = 'auto';
    setExpandedAccordions({}); // Reset accordions when closing modal
  };

  // Accordion management inside modals
  const toggleAccordion = (accordionId) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [accordionId]: !prev[accordionId]
    }));
  };

  // Close modal on ESC key or outside click
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && activeModal) closeModal();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [activeModal]);

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeModal();
    }
  };

  return (
    <div className="wealthai-automations">
      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          <section className="automations-section">
            <div className='flex justify-center relative items-center h-[100px] '>
              <img src={AutomationAI1Logo} alt="AutomationAI1Logo" className="w-[120px] h-[80px] mb-[30px] absolute top-[0px] left-[10px]" />
              <img src={AutomationAI} alt="AutomationAI" className="w-[300px] h-[40px] mb-[30px] mt-[25px]" />
              <div className="flex flex-wrap gap-3 absolute top-[35px] right-[10px]">
                      <button className="px-[6px] py-[3px] shadow-md shadow-gray-200 rounded-md font-medium border-gray-200 text-[13px] transition-all duration-300 flex flex-col items-center justify-center backdrop-blur-sm border bg-white">Get Started</button>
                      <button className="px-[6px] py-[3px] shadow-md shadow-gray-200 rounded-md font-medium border-gray-200 text-[13px] transition-all duration-300 flex flex-col items-center justify-center backdrop-blur-sm border bg-white">Samples</button>
                      <button className="px-[6px] py-[3px] shadow-md shadow-gray-200 rounded-md font-medium border-gray-200 text-[13px] transition-all duration-300 flex flex-col items-center justify-center backdrop-blur-sm border bg-white">Contact Us</button>
              </div>
            </div>

            <div className="services-grid">
              {/* Automated Posting Card */}
              <div className="service-card" onClick={() => openModal('posting')}>
                <div className="card-content">
                  <div className="card-icon">📱</div>
                  <div className="card-text">
                    <h3 className="card-title">Posting</h3>
                    <p className="card-subtitle">Schedule and automate your market content across social platforms</p>
                    <div className="card-platforms">
                      <Whatsapp />
                      <span className="platform-tag">Facebook</span>
                      <span className="platform-tag">LinkedIn</span>
                      <span className="platform-tag">Telegram</span>
                    </div>
                  </div>
                  <div className="card-arrow">→</div>
                </div>
              </div>

              {/* Automated Replying Card */}
              <div className="service-card" onClick={() => openModal('replying')}>
                <div className="card-content">
                  <div className="card-icon">💬</div>
                  <div className="card-text">
                    <h3 className="card-title">Engagement</h3>
                    <p className="card-subtitle">Smart AI responses for social media engagement</p>
                    <div className="card-platforms">
                      <span className="platform-tag">Instagram</span>
                      <span className="platform-tag">Facebook Pages</span>
                    </div>
                  </div>
                  <div className="card-arrow">→</div>
                </div>
              </div>

              {/* Social Automations Card */}
              <div className="service-card" onClick={() => openModal('social')}>
                <div className="card-content">
                  <div className="card-icon">📊</div>
                  <div className="card-text">
                    <h3 className="card-title">More...</h3>
                    <p className="card-subtitle">Triggered posts based on your market analysis</p>
                    <div className="card-platforms">
                      <span className="platform-tag">Instagram</span>
                      <span className="platform-tag">Facebook</span>
                      <span className="platform-tag">Custom Plan Only</span>
                    </div>
                  </div>
                  <div className="card-arrow">→</div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="faq-section">
              <h2 className="section-title">FREQUENTLY ASKED QUESTIONS</h2>
              <div className="faq-card" onClick={() => openModal('faq')}>
                <div className="card-content">
                  <div className="card-icon">❓</div>
                  <div className="card-text">
                    <p className="card-subtitle">Get answers to common questions about our automation services</p>
                  </div>
                  <div className="card-arrow">→</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Modals */}
      {activeModal && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-container">
            <button className="modal-close" onClick={closeModal}>✕</button>

            {activeModal === 'posting' && <PostingModal expandedAccordions={expandedAccordions} toggleAccordion={toggleAccordion} />}
            {activeModal === 'replying' && <ReplyingModal expandedAccordions={expandedAccordions} toggleAccordion={toggleAccordion} />}
            {activeModal === 'social' && <SocialModal expandedAccordions={expandedAccordions} toggleAccordion={toggleAccordion} />}
            {activeModal === 'faq' && <FAQModal />}
          </div>
        </div>
      )}
    </div>
  );
};

// Modal Components
const PostingModal = ({ expandedAccordions, toggleAccordion }) => (
  <div className="modal-content">
    <h2 className="modal-title">AUTOMATED POSTING</h2>
    <div className="modal-body">
      <p className="modal-overview">Schedule and automate your market content distribution across multiple social media platforms with AI-powered timing and content optimization.</p>

      <AccordionItem
        id="posting-platforms"
        title="Supported Platforms"
        isExpanded={expandedAccordions['posting-platforms']}
        onToggle={() => toggleAccordion('posting-platforms')}
      >
        <ul>
          <li>Instagram - Stories, posts, and reels</li>
          <li>Facebook - Pages and business profiles</li>
          <li>LinkedIn - Company pages and personal profiles</li>
          <li>Telegram - Groups and channels</li>
        </ul>
      </AccordionItem>

      <AccordionItem
        id="posting-daily"
        title="Daily Posts"
        isExpanded={expandedAccordions['posting-daily']}
        onToggle={() => toggleAccordion('posting-daily')}
      >
        <ul>
          <li>Market Open Summary at 9:00 AM</li>
          <li>Opening sentiment analysis with AI insights</li>
          <li>Market predictions based on technical analysis</li>
          <li>Market Close Summary at 4:00 PM</li>
          <li>Top gainers and losers with performance metrics</li>
          <li>Hourly market updates (customizable and configurable)</li>
        </ul>
      </AccordionItem>

      <AccordionItem
        id="posting-weekly"
        title="Weekly Roundups"
        isExpanded={expandedAccordions['posting-weekly']}
        onToggle={() => toggleAccordion('posting-weekly')}
      >
        <ul>
          <li>Custom equities analysis with performance tracking</li>
          <li>Mutual funds performance review and recommendations</li>
        </ul>
      </AccordionItem>

      <AccordionItem
        id="posting-monthly"
        title="Monthly Reports"
        isExpanded={expandedAccordions['posting-monthly']}
        onToggle={() => toggleAccordion('posting-monthly')}
      >
        <ul>
          <li>Comprehensive equities summary with custom insights</li>
          <li>Detailed mutual funds review and market analysis</li>
        </ul>
      </AccordionItem>

      <AccordionItem
        id="posting-quarterly"
        title="Quarterly Analysis"
        isExpanded={expandedAccordions['posting-quarterly']}
        onToggle={() => toggleAccordion('posting-quarterly')}
      >
        <ul>
          <li>Market performance review with trend analysis</li>
          <li>Equities and mutual funds comprehensive report</li>
        </ul>
      </AccordionItem>

      <AccordionItem
        id="posting-yearly"
        title="Annual Reports"
        isExpanded={expandedAccordions['posting-yearly']}
        onToggle={() => toggleAccordion('posting-yearly')}
      >
        <ul>
          <li>Yearly market summary with key highlights</li>
          <li>Investment performance analysis and projections</li>
        </ul>
      </AccordionItem>

      <AccordionItem
        id="posting-custom"
        title="Custom Events"
        isExpanded={expandedAccordions['posting-custom']}
        onToggle={() => toggleAccordion('posting-custom')}
      >
        <ul>
          <li>Client birthdays (Telegram channels only)</li>
          <li>Anniversaries and special occasions (Telegram only)</li>
          <li>Children\'s birthdays and family events (Telegram only)</li>
        </ul>
      </AccordionItem>
    </div>
  </div>
);

const ReplyingModal = ({ expandedAccordions, toggleAccordion }) => (
  <div className="modal-content">
    <h2 className="modal-title">AUTOMATED REPLYING</h2>
    <div className="modal-body">
      <p className="modal-overview">Intelligent AI-powered response system that classifies user intent and provides contextually appropriate replies while maintaining brand consistency and filtering inappropriate content.</p>

      <AccordionItem
        id="replying-platforms"
        title="Platform Support"
        isExpanded={expandedAccordions['replying-platforms']}
        onToggle={() => toggleAccordion('replying-platforms')}
      >
        <ul>
          <li>Instagram - Comments, direct messages, and story replies</li>
          <li>Facebook Pages - Comments, messages, and post interactions</li>
        </ul>
      </AccordionItem>

      <AccordionItem
        id="replying-engagement"
        title="Positive Engagement"
        isExpanded={expandedAccordions['replying-engagement']}
        onToggle={() => toggleAccordion('replying-engagement')}
      >
        <ul>
          <li>Constructive feedback replies with personalized responses</li>
          <li>Appreciation responses for positive comments</li>
          <li>Question answering with accurate information</li>
        </ul>
      </AccordionItem>

      <AccordionItem
        id="replying-filtering"
        title="Content Filtering & Moderation"
        isExpanded={expandedAccordions['replying-filtering']}
        onToggle={() => toggleAccordion('replying-filtering')}
      >
        <ul>
          <li>Abuse detection with automatic no-response protocol</li>
          <li>Spam filtering with advanced pattern recognition</li>
          <li>Context-aware replies based on sentiment analysis</li>
        </ul>
      </AccordionItem>
    </div>
  </div>
);

const SocialModal = ({ expandedAccordions, toggleAccordion }) => (
  <div className="modal-content">
    <h2 className="modal-title">SOCIAL AUTOMATIONS</h2>
    <div className="modal-body">
      <p className="modal-overview">Advanced triggered posting system based on your personal market analysis and trading strategies. Generate content automatically when specific market conditions are met.</p>

      <AccordionItem
        id="social-platforms"
        title="Platform Support"
        isExpanded={expandedAccordions['social-platforms']}
        onToggle={() => toggleAccordion('social-platforms')}
      >
        <ul>
          <li>Instagram - Automated posts and stories</li>
          <li>Facebook - Page posts and updates</li>
        </ul>
      </AccordionItem>

      <AccordionItem
        id="social-plan"
        title="Plan Information"
        isExpanded={expandedAccordions['social-plan']}
        onToggle={() => toggleAccordion('social-plan')}
      >
        <p>This feature is available exclusively as part of our Custom Plan subscription.</p>
      </AccordionItem>

      <AccordionItem
        id="social-insights"
        title="Daily Market Insights"
        isExpanded={expandedAccordions['social-insights']}
        onToggle={() => toggleAccordion('social-insights')}
      >
        <ul>
          <li>Support and resistance level identification with real-time updates</li>
          <li>Breakout stock alerts based on technical indicators</li>
          <li>Custom technical analysis posts generated from your strategies</li>
          <li>Personal trading insights and market commentary</li>
        </ul>
      </AccordionItem>
    </div>
  </div>
);

const FAQModal = () => {
  const faqs = [
    {
      q: "What social media platforms and channels do you support for comprehensive automated posting and content distribution?",
      a: "We support Instagram, Facebook, LinkedIn, and Telegram groups/channels for automated content distribution across all major social platforms."
    },
    {
      q: "How does your advanced automated replying system work with AI-powered intent classification and response generation?",
      a: "Our AI system uses sophisticated intent classification to identify positive interactions, constructive feedback, and genuine questions, providing contextually appropriate responses while filtering out abusive content."
    },
    {
      q: "What specific features and tools are included in your custom market analysis and trading insights package?",
      a: "Custom analysis includes real-time support and resistance level identification, breakout stock alerts, personalized technical analysis based on your trading strategies, and market sentiment indicators."
    },
    {
      q: "Can I fully customize and configure the automated posting schedule to match my specific content strategy and timing preferences?",
      a: "Yes, you have complete control over scheduling with options for daily, weekly, monthly, quarterly, yearly, and completely custom intervals that align with your content strategy and audience engagement patterns."
    },
    {
      q: "Are there any restrictions or limits on the number of automated posts, replies, and social media interactions per day or month?",
      a: "Posting and interaction limits vary depending on your subscription plan. We offer flexible options including unlimited posting packages. Contact our team for detailed information about plan limits and upgrades."
    },
    {
      q: "How accurate and reliable is your AI-powered sentiment analysis system for market trends and trading signals?",
      a: "Our advanced AI sentiment analysis system utilizes cutting-edge natural language processing technology and achieves over 90% accuracy in identifying market sentiment patterns, trend predictions, and trading signal generation."
    }
  ];

  return (
    <div className="modal-content">
      <h2 className="modal-title">FREQUENTLY ASKED QUESTIONS</h2>
      <div className="modal-body faq-list">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <h3 className="faq-question">{faq.q}</h3>
            <p className="faq-answer">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Reusable Accordion Component
const AccordionItem = ({ id, title, children, isExpanded, onToggle }) => (
  <div className="accordion-item">
    <div className="accordion-header" onClick={onToggle}>
      <h3 className="accordion-title">{title}</h3>
      <span className="accordion-icon">{isExpanded ? '−' : '+'}</span>
    </div>
    {isExpanded && (
      <div className="accordion-content">
        {children}
      </div>
    )}
  </div>
);

export default WealthAIAutomations;
