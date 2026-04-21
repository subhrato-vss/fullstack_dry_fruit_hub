import React from 'react';
import { Award, Truck, ShieldCheck, HeartPulse } from 'lucide-react';
import './ValueProp.css';

const ValueProp = () => {
    const props = [
        {
            icon: <Award size={32} />,
            title: 'Gold Standard Quality',
            desc: 'Only the top 5% of global harvests meet our premium standards.'
        },
        {
            icon: <Truck size={32} />,
            title: 'Express Fresh Delivery',
            desc: 'Vacuum-sealed packaging delivered within 48 hours to preserve crunch.'
        },
        {
            icon: <ShieldCheck size={32} />,
            title: 'Ethically Sourced',
            desc: 'Direct-from-farm partnerships ensuring fair trade and purity.'
        },
        {
            icon: <HeartPulse size={32} />,
            title: 'AI Nutrition Edge',
            desc: 'Personalized superfood recommendations powered by advanced AI.'
        }
    ];

    return (
        <section className="value-prop-landing">
            <div className="container prop-grid">
                {props.map((prop, index) => (
                    <div key={index} className="prop-card glass">
                        <div className="prop-icon">
                            {prop.icon}
                        </div>
                        <h3>{prop.title}</h3>
                        <p>{prop.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ValueProp;
