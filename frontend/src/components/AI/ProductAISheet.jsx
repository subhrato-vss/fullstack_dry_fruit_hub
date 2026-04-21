import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, User, Bot, Loader2 } from 'lucide-react';
import api from '../../services/api';
import './ProductAISheet.css';

const ProductAISheet = ({ isOpen, onClose, product }) => {
    const [messages, setMessages] = useState([
        { 
            role: 'bot', 
            content: `Hello! I'm your DryFruit Hub Assistant. How can I help you today regarding our premium ${product?.name}?` 
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
        if (e) e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const response = await api.post('/ai/ask-product', {
                productId: product.id,
                question: userMessage
            });

            setMessages(prev => [...prev, { role: 'bot', content: response.answer }]);
        } catch (err) {
            console.error('AI Error:', err);
            setMessages(prev => [...prev, { role: 'bot', content: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment." }]);
        } finally {
            setLoading(false);
        }
    };

    const suggestedQuestions = [
        "What are the health benefits?",
        "Nutritional value per 100g?",
        "How much should I eat daily?",
        "Is it good for immunity?"
    ];

    if (!isOpen) return null;

    return (
        <div className={`ai-sheet-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
            <div className="ai-sheet glass" onClick={e => e.stopPropagation()}>
                <div className="ai-sheet-header">
                    <div className="title-group">
                        <Sparkles className="spark-icon" />
                        <div>
                            <h3>AI Product Assistant</h3>
                            <span className="status">Online & Grounded</span>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                </div>

                <div className="ai-messages">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`message-wrapper ${msg.role}`}>
                            <div className="avatar">
                                {msg.role === 'bot' ? <Bot size={18} /> : <User size={18} />}
                            </div>
                            <div className="message-bubble glass">
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="message-wrapper bot">
                            <div className="avatar"><Bot size={18} /></div>
                            <div className="message-bubble glass loading-bubble">
                                <Loader2 className="spin" size={20} />
                                <span>Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="ai-sheet-footer">
                    <div className="suggestions">
                        {suggestedQuestions.map((q, idx) => (
                            <button key={idx} className="suggestion-chip glass" onClick={() => { setInput(q); }}>
                                {q}
                            </button>
                        ))}
                    </div>
                    <form className="ai-input-wrapper glass" onSubmit={handleSend}>
                        <input 
                            type="text" 
                            placeholder={`Ask about ${product?.name}...`}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                        />
                        <button type="submit" className="send-btn" disabled={loading || !input.trim()}>
                            <Send size={20} />
                        </button>
                    </form>
                    <p className="disclaimer">AI responses are for information only. Consult a nutritionist for medical advice.</p>
                </div>
            </div>
        </div>
    );
};

export default ProductAISheet;
