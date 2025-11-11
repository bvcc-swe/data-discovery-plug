import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Bot, User, Send } from 'lucide-react';
// import axios from 'axios';

/**
 * Week7LiveDemoChat
 * This component demonstrates all the key concepts from Week 7:
 * - Async/await
 * - Mock AI responses
 * - API integration with Express backend
 * - Error/loading state management
 * - Data context integration
 */
const Week7LiveDemoChat = ({ data = [] }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useBackend, setUseBackend] = useState(false); // Toggle between mock and backend

  // Mock AI response logic
  const getMockResponse = async (question) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const lowerQ = question.toLowerCase();
    if (data.length > 0) {
      const values = data.map(item => typeof item === 'object' ? Object.values(item).find(val => typeof val === 'number') : item).filter(val => typeof val === 'number');
      if (values.length > 0) {
        const average = values.reduce((a, b) => a + b, 0) / values.length;
        const max = Math.max(...values);
        const min = Math.min(...values);
        if (lowerQ.includes('average') || lowerQ.includes('mean')) {
          return `Based on your actual data, the average value is ${average.toFixed(2)}.`;
        }
        if (lowerQ.includes('highest') || lowerQ.includes('maximum')) {
          return `The highest value in your dataset is ${max}.`;
        }
        if (lowerQ.includes('lowest') || lowerQ.includes('minimum')) {
          return `The minimum value in your dataset is ${min}.`;
        }
      }
    }
    if (lowerQ.includes('trend') || lowerQ.includes('pattern')) {
      return "I can see an interesting upward trend in your data! There appears to be consistent growth in the later periods.";
    }
    if (lowerQ.includes('why') || lowerQ.includes('reason')) {
      return "While I can see the patterns in your numbers, determining the 'why' requires domain knowledge.";
    }
    return "That's an interesting question about your data! The patterns I see suggest there are meaningful insights to explore.";
  };

  // Send message handler
  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);
    try {
      let aiResponse;
      if (useBackend) {
        // Call Express backend
        const res = await axios.post('/api/messages', { text: currentInput });
        aiResponse = res.data.message || res.data.text || 'No response from backend.';
      } else {
        // Use mock AI
        aiResponse = await getMockResponse(currentInput);
      }
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        content: "Sorry, I'm having trouble processing your request.",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick suggestions
  const suggestions = [
    "What trends do you see?",
    "What's the average?",
    "Any outliers?",
    "Explain the data"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Week 7 AI Chat Demo
        </CardTitle>
        <div className="mt-2 flex gap-2 items-center">
          <label className="text-sm flex items-center gap-1">
            <input type="checkbox" checked={useBackend} onChange={e => setUseBackend(e.target.checked)} />
            Use backend API
          </label>
          <span className="text-xs text-gray-500">(Toggle to switch between mock and Express backend)</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chat Messages */}
        <div className="h-64 overflow-y-auto space-y-3 p-3 bg-gray-50 rounded">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Ask me anything about your data!</p>
              <p className="text-sm mt-1">Try: "What's the average?" or "Do you see any trends?"</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${msg.type === 'user' ? 'bg-blue-600 text-white' : 'bg-white border shadow-sm'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {msg.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    <span className="text-xs opacity-75">{msg.type === 'user' ? 'You' : 'AI Assistant'}</span>
                  </div>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border shadow-sm max-w-xs px-3 py-2 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="h-4 w-4" />
                  <span className="text-xs opacity-75">AI Assistant</span>
                </div>
                <span className="text-xs text-gray-500 ml-2">Thinking...</span>
              </div>
            </div>
          )}
        </div>
        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            placeholder="Ask about your data..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {/* Quick Suggestions */}
        <div className="flex flex-wrap gap-2">
          {suggestions.map(suggestion => (
            <Badge 
              key={suggestion}
              variant="outline" 
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => setInput(suggestion)}
            >
              {suggestion}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Week7LiveDemoChat;
