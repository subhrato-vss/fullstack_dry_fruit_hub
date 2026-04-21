import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import './AIAssistant.css';
import { Send, Sparkles, BrainCircuit, Heart, Zap, User, ArrowLeft, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const AIAssistant = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            text: "Hello! I am your DryFruit Hub AI Nutritionist. I can help you find the perfect dry fruits for your health goals. What are you looking to achieve today?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = {
            id: Date.now(),
            type: 'user',
            text: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const data = await api.post('/ai/ask-general', { question: input });
            
            const aiMsg = {
                id: Date.now() + 1,
                type: 'ai',
                text: data.answer,
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            console.error('AI Error:', err);
            setMessages(prev => [...prev, {
                id: Date.now() + 2,
                type: 'ai',
                text: "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try again in a moment.",
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const quickTopics = [
        { icon: <Heart size={18} />, label: "Heart Health", query: "Which dry fruits are best for heart health?" },
        { icon: <Zap size={18} />, label: "Weight Loss", query: "Can you suggest dry fruits for weight loss?" },
        { icon: <BrainCircuit size={18} />, label: "Brain Power", query: "Which nuts help in memory and focus?" },
        { icon: <Sparkles size={18} />, label: "Glowing Skin", query: "Best dry fruits for skin and hair?" }
    ];

    return (
        <div className="ai-assistant-page animate-fade">
            <div className="container assistant-layout">
                {/* Sidebar */}
                <aside className="assistant-sidebar">
                    <Link to="/" className="back-btn">
                        <ArrowLeft size={18} /> Back to Store
                    </Link>
                    
                    <div className="sidebar-group">
                        <h3>Ask About...</h3>
                        <div className="quick-topics">
                            {quickTopics.map((topic, i) => (
                                <button 
                                    key={i} 
                                    className="topic-btn glass"
                                    onClick={() => setInput(topic.query)}
                                >
                                    {topic.icon}
                                    <span>{topic.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="ai-stats-card glass">
                        <div className="stat-item">
                            <span className="label">Expertise</span>
                            <span className="value">Nutrition & Wellness</span>
                        </div>
                        <div className="stat-item">
                            <span className="label">Base</span>
                            <span className="value">Verified Scientific Data</span>
                        </div>
                    </div>

                    <button className="clear-chat" onClick={() => setMessages([messages[0]])}>
                        <Trash2 size={16} /> Clear Conversation
                    </button>
                </aside>

                {/* Main Chat Area */}
                <main className="chat-container glass">
                    <header className="chat-header">
                        <div className="ai-profile">
                            <div className="ai-avatar">
                                <BrainCircuit size={24} />
                            </div>
                            <div>
                                <h2>AI Nutrition Assistant</h2>
                                <span className="online-status">Online and ready to help</span>
                            </div>
                        </div>
                    </header>

                    <div className="messages-flow">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`message-wrapper ${msg.type}`}>
                                {msg.type === 'ai' && (
                                    <div className="msg-avatar ai">
                                        <Sparkles size={14} />
                                    </div>
                                )}
                                <div className="message-bubble">
                                    <p>{msg.text}</p>
                                    <span className="msg-time">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                {msg.type === 'user' && (
                                    <div className="msg-avatar user">
                                        <User size={14} />
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="message-wrapper ai">
                                <div className="msg-avatar ai">
                                    <Sparkles size={14} />
                                </div>
                                <div className="message-bubble typing">
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chat-input-area" onSubmit={handleSend}>
                        <input 
                            type="text" 
                            placeholder="Ask about nutrition, weight loss, or healthy snacking..." 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                        />
                        <button type="submit" className="send-btn" disabled={!input.trim() || loading}>
                            <Send size={20} />
                        </button>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default AIAssistant;
