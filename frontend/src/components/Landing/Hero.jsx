import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, ShieldCheck, Truck, Zap } from 'lucide-react';
import './Hero.css';

const images = [
    "/images/hero/hero_1.png",
    "/images/hero/hero_2.png",
    "/images/hero/hero_3.png"
];

const Hero = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="hero-landing">
            <div className="container hero-grid">
                <div className="hero-text-content animate-slide-up">
                    <div className="trust-badges">
                        <span className="trust-badge"><ShieldCheck size={16} /> 100% Organic</span>
                        <span className="trust-badge"><Zap size={16} /> Freshly Sourced</span>
                    </div>
                    <h1>Premium Dry Fruits <br /> <span className="title-accent">Delivered Fresh</span></h1>
                    <p className="hero-description">
                        Experience nature's finest superfoods, handpicked and packed with love. 
                        Wholesome nutrition for your family, curated with premium standards.
                    </p>
                    <div className="hero-actions">
                        <Link to="/products" className="btn btn-primary btn-lg">Shop Collection</Link>
                        <Link to="/ai-assistant" className="btn btn-secondary btn-lg btn-glass">
                            <Play size={16} fill="white" /> Consult AI Nutritionist
                        </Link>
                    </div>
                    <div className="hero-stats">
                        <div className="stat">
                            <span className="stat-num">50k+</span>
                            <span className="stat-label">Happy Customers</span>
                        </div>
                        <div className="stat">
                            <span className="stat-num">100+</span>
                            <span className="stat-label">Product Varieties</span>
                        </div>
                    </div>
                </div>
                <div className="hero-visual animate-fade-in">
                    <div className="hero-main-img-container">
                        {images.map((img, index) => (
                            <img 
                                key={index}
                                src={img} 
                                alt={`Premium Dry Fruits ${index + 1}`} 
                                className={`hero-main-img ${index === currentImageIndex ? 'active' : ''}`}
                            />
                        ))}
                        
                        <div className="floating-card product-card-sm glass">
                            <img src="/images/hero/almonds_sm.png" alt="Almonds" />
                            <div>
                                <h4>Premium Almonds</h4>
                                <p>₹850.00</p>
                            </div>
                        </div>
                        <div className="floating-card review-card glass">
                            <div className="avatar-stack">
                                <img src="https://i.pravatar.cc/40?u=1" alt="U1" />
                                <img src="https://i.pravatar.cc/40?u=2" alt="U2" />
                            </div>
                            <p>"Best quality I've ever had!"</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="scroll-indicator">
                <div className="mouse"></div>
                <span>Scroll to explore</span>
            </div>
        </section>
    );
};

export default Hero;
