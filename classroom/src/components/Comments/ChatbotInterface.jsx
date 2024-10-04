import React, { useState, useRef, useEffect } from 'react';
import { Search, X, MessageCircle, Send } from 'lucide-react';

const ChatbotInterface = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [messages, setMessages] = useState([
    { text: "Hey there 👋 How can we help?", sender: 'bot' },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const topics = [
    "Admission Process", "Eligibility Criteria", "Fee Structure",
    "Scholarships", "Hostel Facilities", "Placement Opportunities"
  ];

  const topicQuestions = {
    "Admission Process": [
      "What are the steps in the admission process?",
      "When does the admission process start?",
      "Is there an entrance exam required?"
    ],
    "Eligibility Criteria": [
      "What are the minimum marks required for admission?",
      "Is there an age limit for applying?",
      "Are there any special quotas for admission?"
    ],
    "Fee Structure": [
      "What is the annual tuition fee?",
      "Are there any additional charges?",
      "Is there a fee concession for economically weaker sections?"
    ],
    "Scholarships": [
      "What scholarships are available?",
      "How can I apply for a scholarship?",
      "What are the criteria for scholarship selection?"
    ],
    "Hostel Facilities": [
      "Are hostel facilities available for all students?",
      "What are the hostel fees?",
      "What amenities are provided in the hostels?"
    ],
    "Placement Opportunities": [
      "What companies visit for campus placements?",
      "What is the average package offered?",
      "Is there a placement cell in the college?"
    ]
  };

  const answers = {
    "Admission Process": {
      "What are the steps in the admission process?": "The admission process involves: 1. Online application submission, 2. Entrance exam (if applicable), 3. Document verification, 4. Counselling, 5. Fee payment, 6. Final admission.",
      "When does the admission process start?": "The admission process typically starts in May-June each year. Please check our website for exact dates.",
      "Is there an entrance exam required?": "Yes, we conduct a college-specific entrance exam. Some courses may also accept JEE/NEET scores."
    },
    "Eligibility Criteria": {
      "What are the minimum marks required for admission?": "The minimum marks required are 60% in 10+2 for general category, and 55% for SC/ST candidates.",
      "Is there an age limit for applying?": "Candidates should be less than 25 years of age as of July 1st of the admission year.",
      "Are there any special quotas for admission?": "Yes, we have quotas for SC/ST, OBC, and differently-abled candidates as per government norms."
    },
    "Fee Structure": {
      "What is the annual tuition fee?": "The annual tuition fee ranges from Rs. 80,000 to Rs. 1,50,000 depending on the course.",
      "Are there any additional charges?": "Yes, there are additional charges for lab facilities, library, and other amenities. These amount to approximately Rs. 20,000 per year.",
      "Is there a fee concession for economically weaker sections?": "Yes, we offer fee concessions for economically weaker sections. Please contact the admission office for details."
    },
    "Scholarships": {
      "What scholarships are available?": "We offer merit-based scholarships, sports scholarships, and need-based financial aid.",
      "How can I apply for a scholarship?": "You can apply for scholarships through the college portal after securing admission. The application window opens in August each year.",
      "What are the criteria for scholarship selection?": "Criteria vary based on the type of scholarship. Merit scholarships consider academic performance, sports scholarships look at achievements in sports, and need-based aid considers family income."
    },
    "Hostel Facilities": {
      "Are hostel facilities available for all students?": "Hostel facilities are available on a first-come, first-served basis. We accommodate most first-year students.",
      "What are the hostel fees?": "Hostel fees are approximately Rs. 60,000 per year, including accommodation and meals.",
      "What amenities are provided in the hostels?": "Our hostels provide Wi-Fi, laundry services, 24/7 security, common rooms, and mess facilities."
    },
    "Placement Opportunities": {
      "What companies visit for campus placements?": "Top companies like TCS, Infosys, Wipro, Amazon, and many more visit our campus for placements.",
      "What is the average package offered?": "The average package for the last academic year was Rs. 6.5 LPA, with the highest being Rs. 25 LPA.",
      "Is there a placement cell in the college?": "Yes, we have an active placement cell that works year-round to ensure good placement opportunities for our students."
    }
  };

  const specificResponses = {
    "What are the eligibility criteria for admission to undergraduate engineering programs?":
      "You need to have completed Class 12 with Physics, Chemistry, and Mathematics, and clear an entrance exam like JEE Main or CET with a minimum required score.",
    "How do I apply for scholarships, and what options are available?":
      "Scholarship options include merit-based, need-based, and government scholarships. Apply through the college's website or national portals, and make sure to check deadlines and eligibility criteria.",
    "What is the admission process for postgraduate courses?":
      "For postgraduate programs, you typically need a bachelor's degree in the relevant field and must clear entrance exams like GATE or institute-specific tests. Some courses may require an interview as well."
  };

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setMessages([...messages,
      { text: topic, sender: 'user' },
      { text: `Please select a specific question about ${topic}:`, sender: 'bot' }
    ]);
  };

  const handleQuestionSelect = (question) => {
    const answer = answers[selectedTopic][question];
    setMessages([...messages,
      { text: question, sender: 'user' },
      { text: answer, sender: 'bot' }
    ]);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() !== '') {
      setMessages([...messages, { text: inputMessage, sender: 'user' }]);
      setInputMessage('');

      // Check for specific responses
      if (specificResponses.hasOwnProperty(inputMessage.trim())) {
        setTimeout(() => {
          setMessages(prevMessages => [...prevMessages,
            { text: specificResponses[inputMessage.trim()], sender: 'bot' }
          ]);
        }, 1000);
      } else {
        // Generic response for other messages
        setTimeout(() => {
          setMessages(prevMessages => [...prevMessages,
            { text: "Thank you for your message. Our team will get back to you soon with a personalized response.", sender: 'bot' }
          ]);
        }, 1000);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {isOpen ? (
        <div className="fixed bottom-4 right-4 w-96 h-[32rem] flex flex-col bg-gray-800 text-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-900 p-4 flex items-center justify-between">
            <div className="text-xl font-bold">Student Help</div>
            <X className="cursor-pointer" onClick={toggleChat} />
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            <div className="flex space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 bg-gray-600 rounded-full" />
              ))}
            </div>
            <div>Need help? We've got your back.</div>
            {messages.map((message, index) => (
              <div key={index} className={`${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-2 rounded-lg ${
                  message.sender === 'user' ? 'bg-blue-500' : 'bg-gray-700'
                }`}>
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
            {!selectedTopic && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                {topics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => handleTopicSelect(topic)}
                    className="bg-gray-700 p-2 rounded-lg text-left"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            )}
            {selectedTopic && (
              <div className="grid grid-cols-1 gap-2 mt-4">
                {topicQuestions[selectedTopic].map((question) => (
                  <button
                    key={question}
                    onClick={() => handleQuestionSelect(question)}
                    className="bg-gray-700 p-2 rounded-lg text-left"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="p-4 bg-gray-900">
            <div className="relative flex items-center">
              <input
                type="text"
                className="flex-grow bg-gray-800 rounded-full py-2 pl-10 pr-4"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" />
              <button
                onClick={handleSendMessage}
                className="ml-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors duration-200"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={toggleChat}
          className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-200"
        >
          <MessageCircle size={24} />
        </button>
      )}
    </>
  );
};

export default ChatbotInterface;
