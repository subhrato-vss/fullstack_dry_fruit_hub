import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, MessageSquare, Sparkles, Heart } from 'lucide-react';
import './AIHeroSection.css';

const AIHeroSection = () => {
    return (
        <section className="ai-hero-section containerr">
            <div className="container ai-hero-grid glass">
                <div className="ai-visual-side animate-fade-in">
                    <img 
                        src="/images/ai/ai_visual.png" 
                        alt="AI Nutrition Assistant" 
                        className="ai-main-img"
                    />
                    <div className="ai-glow-effect"></div>
                </div>
                
                <div className="ai-content-side">
                    <span className="badge-ai"><Sparkles size={14} /> Only on Dryfruit Hub</span>
                    <h2>Meet Your Personal <br /><span className="text-ai">AI Nutritionist</span></h2>
                    <p className="ai-desc">
                        Confused about which dry fruits are best for your health goals? 
                        Our advanced AI analyzing your needs to provide personalized superfood 
                        recommendations and nutrition insights.
                    </p>
                    
                    <ul className="ai-features">
                        <li><MessageSquare size={18} /> Ask health & nutrition questions</li>
                        <li><BrainCircuit size={18} /> Get personalized dry fruit blends</li>
                        <li><Heart size={18} /> Track your nutritional goals</li>
                    </ul>
                    
                    <div className="ai-cta-group">
                        <Link to="/ai-assistant" className="btn btn-primary btn-ai">
                            Try AI Assistant
                        </Link>
                        <span className="ai-status">
                            <span className="status-dot"></span> Online & Ready
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AIHeroSection;
