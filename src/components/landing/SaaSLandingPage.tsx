
import React, { useEffect, useState } from 'react';
import { ArrowRight, Zap, Target, TrendingUp, Users, Play, CheckCircle, Star } from 'lucide-react';
import './SaaSLandingPage.css';

const SaaSLandingPage = () => {
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <Zap />,
      title: "AI-Powered Learning",
      description: "Intelligent tutoring system that adapts to each student's learning pace and style"
    },
    {
      icon: <Target />,
      title: "Gamified Experience",
      description: "Transform learning into an engaging quest with levels, achievements, and rewards"
    },
    {
      icon: <TrendingUp />,
      title: "Advanced Analytics",
      description: "Deep insights into learning progress and performance optimization"
    },
    {
      icon: <Users />,
      title: "Collaborative Learning",
      description: "Interactive groups, discussions, and peer-to-peer knowledge sharing"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Create Your Learning Path",
      description: "Set up courses with AI-generated content and personalized learning objectives"
    },
    {
      number: "02", 
      title: "Engage & Gamify",
      description: "Students progress through quests, earn XP, and unlock achievements"
    },
    {
      number: "03",
      title: "Track & Optimize",
      description: "Monitor progress with real-time analytics and AI-driven insights"
    }
  ];

  const testimonials = [
    {
      name: "Ahmed Hassan",
      role: "Computer Science Professor",
      location: "Cairo University",
      content: "Revolutionary platform that transformed how my students engage with complex algorithms",
      rating: 5
    },
    {
      name: "Sarah Mohamed",
      role: "Learning Director", 
      location: "Alexandria Institute",
      content: "The AI tutoring feature increased our completion rates by 340%",
      rating: 5
    }
  ];

  return (
    <div className="saas-landing">
      {/* Hero Section */}
      <section className="hero-section" id="hero" data-animate>
        <div className="hero-background">
          <div className="floating-orb orb-1"></div>
          <div className="floating-orb orb-2"></div>
          <div className="floating-orb orb-3"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-badge">
            <span>🚀 Egypt's First AI-Gamified LMS</span>
          </div>
          
          <h1 className="hero-title">
            Transform Learning Into
            <span className="gradient-text"> Epic Quests</span>
          </h1>
          
          <p className="hero-subtitle">
            The world's most advanced AI-powered learning management system that gamifies education, 
            making knowledge acquisition as addictive as your favorite game.
          </p>
          
          <div className="hero-cta">
            <button className="cta-primary">
              <span>Start Your Journey</span>
              <ArrowRight size={20} />
            </button>
            <button className="cta-secondary">
              <Play size={18} />
              <span>Watch Demo</span>
            </button>
          </div>
          
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Active Learners</span>
            </div>
            <div className="stat">
              <span className="stat-number">2M+</span>
              <span className="stat-label">Quests Completed</span>
            </div>
            <div className="stat">
              <span className="stat-number">98%</span>
              <span className="stat-label">Satisfaction Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features" data-animate>
        <div className="container">
          <div className="section-header">
            <h2>Powered by Next-Gen AI Technology</h2>
            <p>Experience learning like never before with our revolutionary features</p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`feature-card ${isVisible.features ? 'animate-in' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section" id="how-it-works" data-animate>
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Three simple steps to revolutionize your learning experience</p>
          </div>
          
          <div className="steps-container">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`step-card ${isVisible['how-it-works'] ? 'animate-in' : ''}`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="step-number">{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                {index < steps.length - 1 && <div className="step-connector"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="demo-section" id="demo" data-animate>
        <div className="container">
          <div className="demo-content">
            <div className="demo-text">
              <h2>See Learning Quests in Action</h2>
              <p>Watch how our AI transforms traditional lessons into engaging adventures</p>
              <ul className="demo-features">
                <li><CheckCircle size={16} /> Real-time AI tutoring</li>
                <li><CheckCircle size={16} /> Adaptive difficulty scaling</li>
                <li><CheckCircle size={16} /> Instant feedback & rewards</li>
                <li><CheckCircle size={16} /> Progress tracking & analytics</li>
              </ul>
            </div>
            <div className="demo-visual">
              <div className="demo-mockup">
                <div className="mockup-header">
                  <div className="mockup-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <div className="mockup-content">
                  <div className="quest-card">
                    <div className="quest-header">
                      <h4>🧠 Neural Networks Quest</h4>
                      <span className="xp-badge">+250 XP</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill"></div>
                    </div>
                    <p>Master the fundamentals of deep learning</p>
                  </div>
                  <div className="achievement-popup">
                    <Star size={16} />
                    <span>Achievement Unlocked!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="social-proof-section" id="testimonials" data-animate>
        <div className="container">
          <div className="section-header">
            <h2>Trusted by Egyptian Educators & Learners</h2>
            <p>Join thousands who have transformed their learning journey</p>
          </div>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className={`testimonial-card ${isVisible.testimonials ? 'animate-in' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="testimonial-stars">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p>"{testimonial.content}"</p>
                <div className="testimonial-author">
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.role}, {testimonial.location}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="trust-badges">
            <div className="badge">ISO 27001 Certified</div>
            <div className="badge">GDPR Compliant</div>
            <div className="badge">99.9% Uptime</div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section" id="cta" data-animate>
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Revolutionize Learning?</h2>
            <p>Join Egypt's most innovative educational platform today</p>
            <button className="cta-final">
              <span>Join Egypt's First AI-Gamified LMS</span>
              <ArrowRight size={20} />
            </button>
            <p className="cta-subtext">Start free • No credit card required • Setup in 2 minutes</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SaaSLandingPage;
