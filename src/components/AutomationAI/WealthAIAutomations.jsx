import React, { useState, useEffect } from 'react';
import './WealthAIAutomations.css'; // Import the CSS separately or use styled-components
import AutomationAI from '../../Assets/AutomationAI.png';
import AutomationAI1Logo from '../../Assets/AutomationAI1Logo.png';
// import Logo1 from '../../Assets/Logo1.png';
import Whatsapp from '../SocialmediaIcon/Whatsapp';
import Facebook from '../SocialmediaIcon/Facebook';
import Linkedin from '../SocialmediaIcon/Linkedin';
import Telegram from '../SocialmediaIcon/Telegram';
import Insta from '../SocialmediaIcon/Insta';
import { useAuth } from '../../context/AuthContext';


const WealthAIAutomations = ({ setCurrentPage, currentPage, hideHeaderFooter = false }) => {
  const [activeModal, setActiveModal] = useState(null);
  const [expandedAccordions, setExpandedAccordions] = useState({});
  const [commonPopup, setCommonPopup] = useState(false)
  const { user } = useAuth();
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

  const validMail = 'wealthwisersfinancialservices@gmail.com' || 'rachit.gour749@gmail.com' || 'iamshourya007@gmail.com' || 'rm1.tradeai1@gmail.com' || 'mohitsharma7258@gmail.com';

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
      {commonPopup ? <div clasName="border-2 border-black">True</div> : <></>}
      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          <section className="automations-section mt-[-20px]">
            <div className='flex justify-center relative items-center h-[40px]'>
              <div className="flex flex-wrap gap-3 absolute right-[10px]">
                {/* <button
                  onClick={() => setCurrentPage('home')}
                  className="px-[6px] py-[3px] shadow-md shadow-gray-200 rounded-md font-medium border-gray-200 text-[13px] transition-all duration-300 flex flex-col items-center justify-center backdrop-blur-sm border bg-white hover:bg-gray-50"
                >
                  <span className="mr-1">← Back</span>
                 

                </button> */}
                <button onClick={() => openModal('get-started')} className="px-[6px] py-[3px] shadow-md shadow-gray-200 rounded-md font-medium border-gray-200 text-[13px] transition-all duration-300 flex flex-col items-center justify-center backdrop-blur-sm border bg-white hover:bg-gray-50">Get Started</button>
                <button onClick={() => openModal('samples')} className="px-[6px] py-[3px] shadow-md shadow-gray-200 rounded-md font-medium border-gray-200 text-[13px] transition-all duration-300 flex flex-col items-center justify-center backdrop-blur-sm border bg-white hover:bg-gray-50">Samples</button>
                {/* <button onClick={() => openModal('contact')} className="px-[6px] py-[3px] shadow-md shadow-gray-200 rounded-md font-medium border-gray-200 text-[13px] transition-all duration-300 flex flex-col items-center justify-center backdrop-blur-sm border bg-white hover:bg-gray-50">Contact Us</button> */}
              </div>
            </div>

            <div className="services-grid">
              {/* Automated Posting Card */}
              <div className="service-card" onClick={() => openModal('posting')}>
                <div className="card-content">
                  <div className="card-icon">📱</div>
                  <div className="card-text">
                    <h3 className="card-title">Posting</h3>
                    <p className="card-subtitle">Scheduled or triggered Intelligent Posts</p>
                    <div className="card-platforms">
                      <Whatsapp />
                      <Facebook />
                      <Linkedin />
                      <Telegram />
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
                    <p className="card-subtitle">Automated Intelligent Responses to comments</p>
                    <div className="card-platforms">
                      <Insta />
                      <Facebook />
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
                    <h3 className="card-title">More... <span className='text-[13px] border-gray-300 border px-3 py-1 ml-[5px] mt-[-15px] rounded-[7px] bg-teal-600/30 font-bold text-teal-800'>Customized</span></h3>
                    <p className="card-subtitle">More social media and digital engagement service</p>
                    <div className="card-platforms">
                      <Insta />
                      <Facebook />
                      {/* <span className='text-[13px] border-gray-300 border px-3 py-2 rounded-[7px] bg-teal-600/30 font-bold text-teal-800'>Custom Plan Only</span> */}
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
              <div className='flex justify-center items-center'>
                {user?.email == validMail ? <button className='bg-teal-600 text-white text-center mt-5 px-4 py-2 rounded-md hover:bg-teal-700 transition-colors'><a target='_blank' href="https://forms.zohopublic.in/wealthwisersfinancialservices1/form/SOCIALMEDIAAUTOMATIONREQUIREMENTS/formperma/OxOcFYdW2oC0S06bKiFFUxHOA83hFCDIP5R_Q7GRT1o"> On Boarding Form</a></button> : <></>}
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
            {activeModal === 'get-started' && <GetStartedModal />}
            {activeModal === 'samples' && <SamplesModal />}
            {activeModal === 'contact' && <ContactModal />}
          </div>
        </div>
      )}
    </div>
  );
};

// Modal Components
const PostingModal = ({ expandedAccordions, toggleAccordion }) => (
  <div className="modal-content">
    <h2 className="modal-title">POSTING</h2>
    <div className="modal-body">
      <p className="modal-overview">Schedule and automate your market content distribution across multiple social media platforms with AI-powered timing and content optimization.</p>



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
    <h2 className="modal-title">ENGAGEMENT</h2>
    <div className="modal-body">
      <p className="modal-overview">Intelligent AI-powered response system that classifies user intent and provides contextually appropriate replies while maintaining brand consistency and filtering inappropriate content.</p>


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
          <li>Context-aware replies based on intent analysis</li>
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
          <li>Comment coalition with intent recognition</li>
          <li>Spam classification based on prompts</li>

        </ul>
      </AccordionItem>
    </div>
  </div>
);

const SocialModal = ({ expandedAccordions, toggleAccordion }) => (
  <div className="modal-content">
    <h2 className="modal-title">MORE...</h2>
    <div className="modal-body">
      <p className="modal-overview">More social media and digital engagement service.</p>


      <AccordionItem
        id="social-plan"
        title="Plan Information"
        isExpanded={expandedAccordions['social-plan']}
        onToggle={() => toggleAccordion('social-plan')}
      >
        <p>This feature is available exclusively as part of our Custom Plan subscription.</p>
      </AccordionItem>

      <AccordionItem
        id="social-video"
        title="Video Creation"
        isExpanded={expandedAccordions['social-video']}
        onToggle={() => toggleAccordion('social-video')}
      >
        <ul>
          <li>video creation based on avatars(eg. Heygen)</li>
          <li>Video script using LLM</li>
        </ul>
      </AccordionItem>

      <AccordionItem
        id="social-messages"
        title="Custom Messages/Reminder"
        isExpanded={expandedAccordions['social-messages']}
        onToggle={() => toggleAccordion('social-messages')}
      >
        <ul>
          <li>Support and resistance level identification with real-time updates</li>
          <li>Breakout stock alerts based on technical indicators</li>
          <li>Custom technical analysis posts generated from your strategies</li>
          <li>Personal trading insights and market commentary</li>
        </ul>
      </AccordionItem>

      <AccordionItem
        id="social-corporate"
        title="Corporate Announcements"
        isExpanded={expandedAccordions['social-corporate']}
        onToggle={() => toggleAccordion('social-corporate')}
      >
        <ul>
          <li>Filtered Corporate Announcements from BSE, NSE delivered to whatsapp</li>
        </ul>
      </AccordionItem>

      <AccordionItem
        id="social-website"
        title="Website and SEO"
        isExpanded={expandedAccordions['social-website']}
        onToggle={() => toggleAccordion('social-website')}
      >
        <ul>
          <li>Website Development and maintenance</li>
          <li>Search Engine Optimization</li>
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
      a: "Our AI system uses sophisticated intent classification to identify positive interactions, constructive feedback, and genuine questions, providing contextually appropriate responses while filtering out abusive content (in custom plans). Please note, this feature utilizes publicly available Large Language Models (LLMs) which, like any AI, can sometimes make mistakes or generate unexpected responses."
    },
    // {
    //   q: "What specific features and tools are included in your custom market analysis and trading insights package?",
    //   a: "Custom analysis includes real-time support and resistance level identification, breakout stock alerts, personalized technical analysis based on your trading strategies, and market sentiment indicators."
    // },
    {
      q: "Can I fully customize and configure the automated posting schedule to match my specific content strategy and timing preferences?",
      a: "Yes, you have complete control over scheduling with options for daily, weekly, monthly, quarterly, yearly, and completely custom intervals that align with your content strategy and audience engagement patterns."
    },
    {
      q: "Are there any restrictions or limits on the number of automated posts, replies, and social media interactions per day or month?",
      a: "Posting and interaction limits vary depending on your subscription plan. We offer flexible options including unlimited posting packages. Contact our team for detailed information about plan limits and upgrades."
    },
    // {
    //   q: "How accurate and reliable is your AI-powered sentiment analysis system for market trends and trading signals?",
    //   a: "Our advanced AI sentiment analysis system utilizes cutting-edge natural language processing technology and achieves over 90% accuracy in identifying market sentiment patterns, trend predictions, and trading signal generation."
    // }
  ];

  return (
    <div className="modal-content">
      <h2 className="modal-title">FREQUENTLY ASKED QUESTIONS</h2>
      <div className="modal-body faq-list">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <h3 className="faq-question"><span>Q. </span>{faq.q}</h3>
            <p className="faq-answer"><span>A. </span>{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// New Modal Components
const GetStartedModal = () => (
  <div className="modal-content">
    <h2 className="modal-title">GET STARTED</h2>
    <div className="modal-body">
      <p className="modal-overview">Welcome to AutomationAI1! Let's get you set up with our intelligent automation services.</p>

      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">🚀 Quick Start Options</h3>
          <ul className="space-y-2 text-sm">
            <li>• Start with our Free Trial (7 days)</li>
            <li>• Choose from Basic, Premium, or Custom plans</li>
            <li>• Get personalized setup assistance</li>
          </ul>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">📋 Setup Process</h3>
          <ol className="space-y-1 text-sm list-decimal list-inside">
            <li>Select your automation preferences</li>
            <li>Connect your social media accounts</li>
            <li>Configure posting schedules</li>
            <li>Test with sample content</li>
            <li>Go live with your automation</li>
          </ol>
        </div>

        {/* <div className="flex gap-3 mt-6">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Start Free Trial
          </button>
          <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors">
            View Plans
          </button>
        </div> */}
      </div>
    </div>
  </div>
);

const SamplesModal = () => (
  <div className="modal-content">
    <h2 className="modal-title">SAMPLES</h2>
    <div className="modal-body">
      <p className="modal-overview">Explore our automation capabilities with real examples and live demonstrations.</p>

      <div className="space-y-4">
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800 mb-2">📱 Automated Posts Examples</h3>
          <div className="space-y-2 text-sm">
            <div className="bg-white p-3 rounded border-l-4 border-purple-400">
              <strong>Market Open Summary:</strong> "📈 Market opens bullish with Nifty at 19,250. Key resistance at 19,400. Watch for breakout above 19,500."
            </div>
            <div className="bg-white p-3 rounded border-l-4 border-green-400">
              <strong>Stock Alert:</strong> "🚨 RELIANCE breaks above ₹2,450 resistance. Volume surge indicates strong momentum. Target: ₹2,500"
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="font-semibold text-orange-800 mb-2">💬 Engagement Responses</h3>
          <div className="space-y-2 text-sm">
            <div className="bg-white p-3 rounded">
              <strong>User:</strong> "Great analysis!"<br />
              <strong>AI Response:</strong> "Thank you! Our AI continuously monitors market patterns to provide accurate insights. 📊"
            </div>
          </div>
        </div>

        {/* <div className="flex gap-3 mt-6">
          <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            View Live Demo
          </button>
          <button className="border border-purple-600 text-purple-600 px-6 py-2 rounded-lg hover:bg-purple-50 transition-colors">
            Download Samples
          </button>
        </div> */}
      </div>
    </div>
  </div>
);

const ContactModal = () => (
  <div className="modal-content">
    <h2 className="modal-title">CONTACT US</h2>
    <div className="modal-body">
      <p className="modal-overview">Get in touch with our team for personalized assistance and support.</p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">📞 Direct Contact</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <span className="w-4 h-4 mr-2">📧</span>
                <span>support@wealthai1.in</span>
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 mr-2">📱</span>
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 mr-2">💬</span>
                <span>WhatsApp: +91 98765 43210</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">🕒 Business Hours</h3>
            <div className="text-sm space-y-1">
              <div>Monday - Friday: 9:00 AM - 6:00 PM</div>
              <div>Saturday: 10:00 AM - 4:00 PM</div>
              <div>Sunday: Closed</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">📝 Quick Contact Form</h3>
            <form className="space-y-3">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full p-2 border rounded text-sm"
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full p-2 border rounded text-sm"
              />
              <textarea
                placeholder="Your Message"
                rows="3"
                className="w-full p-2 border rounded text-sm"
              ></textarea>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
          Schedule a Call
        </button>
        <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors">
          Live Chat
        </button>
      </div>
    </div>
  </div>
);

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
