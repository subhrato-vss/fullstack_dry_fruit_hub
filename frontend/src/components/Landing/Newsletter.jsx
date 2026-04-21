import React from 'react';
import { Send } from 'lucide-react';
import './Newsletter.css';

const Newsletter = () => {
    return (
        <section className="newsletter-landing">
            <div className="container newsletter-container glass">
                <div className="newsletter-content">
                    <h2>Join the Healthy Living <br />Community</h2>
                    <p>Subscribe to get 10% off your first order and receive weekly nutrition tips from our AI Assistant.</p>
                </div>
                <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="input-group-landing">
                        <input type="email" placeholder="Enter your email address" required />
                        <button type="submit" className="btn btn-primary">
                            Subscribe <Send size={18} />
                        </button>
                    </div>
                    <p className="privacy-note">We respect your privacy. Unsubscribe at any time.</p>
                </form>
            </div>
        </section>
    );
};

export default Newsletter;
