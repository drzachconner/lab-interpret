import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, TrendingUp, Users, Shield, Zap, LogIn, Star, Heart, Brain } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface Clinic {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  website_url?: string;
  fullscripts_dispensary_url?: string;
  subscription_status: string;
}

interface LandingPageProps {
  clinicContext?: Clinic;
}

// Floating particles component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary/20 rounded-full"
          initial={{ 
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

// Split text animation component
const SplitText = ({ children, className = "", delay = 0 }: { children: string, className?: string, delay?: number }) => {
  const letters = children.split('');
  
  return (
    <motion.div className={className}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5, 
            delay: delay + i * 0.03,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          style={{ display: letter === ' ' ? 'inline' : 'inline-block' }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.div>
  );
};

// Animated feature card
const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 100, scale: 0.8 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ 
        duration: 0.8, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        y: -10,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
    >
      <Card className="card-feature group relative overflow-hidden">
        {/* Animated background gradient */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        
        <CardContent className="p-0 relative z-10">
          <motion.div 
            className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-primary flex items-center justify-center"
            whileHover={{ 
              scale: 1.1, 
              rotate: 5,
              boxShadow: "0 10px 30px rgba(33, 150, 243, 0.3)"
            }}
            transition={{ duration: 0.3 }}
          >
            <Icon className="h-8 w-8 text-white" />
          </motion.div>
          
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
              {title}
            </CardTitle>
          </CardHeader>
          
          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const AnimatedLandingPage = ({ clinicContext }: LandingPageProps = {}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Parallax transforms
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background relative overflow-hidden">
      <FloatingParticles />
      
      {/* Animated Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-background/95 backdrop-blur-sm border-b border-border relative z-50"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <motion.div 
              className="text-2xl font-bold text-foreground"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {clinicContext ? clinicContext.name : "BiohackLabs.ai"}
            </motion.div>
            
            <div className="flex items-center gap-4">
              {user ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    onClick={() => navigate('/dashboard')} 
                    className="btn-primary"
                  >
                    Dashboard
                  </Button>
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="ghost" 
                    onClick={handleSignIn}
                    className="btn-ghost"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with Parallax */}
      <section className="gradient-hero py-20 lg:py-32 relative">
        <motion.div 
          className="absolute inset-0"
          style={{ y: backgroundY }}
        >
          <div className="gradient-hero w-full h-[120%]" />
        </motion.div>
        
        <motion.div 
          className="container mx-auto px-6 text-center relative z-10"
          style={{ y: textY }}
        >
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Animated Headlines */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <SplitText 
                  className="text-5xl lg:text-7xl font-bold text-white leading-tight"
                  delay={0.2}
                >
                  Beyond Generic AI
                </SplitText>
                <br />
                <SplitText 
                  className="text-5xl lg:text-7xl font-bold text-white leading-tight"
                  delay={0.5}
                >
                  Lab Analysis.
                </SplitText>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="text-3xl lg:text-5xl font-bold text-white/90"
              >
                Get Cutting-Edge Biohacker Insights
              </motion.div>

              <motion.p 
                className="text-xl lg:text-2xl text-white/80 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.6 }}
              >
                Elite biohacking & functional medicine methodologies for comprehensive lab analysis
              </motion.p>
            </div>

            {/* Animated Pricing Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
              }}
              className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-md mx-auto shadow-xl border border-white/20"
            >
              <motion.div 
                className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                $19
              </motion.div>
              <div className="text-xl font-semibold text-foreground mb-4">
                Complete Lab Analysis Session
              </div>
              
              <motion.div 
                className="bg-gradient-subtle rounded-2xl p-4"
                whileHover={{ backgroundColor: "rgba(33, 150, 243, 0.1)" }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-sm font-medium text-secondary-dark mb-1">BONUS INCLUDED</div>
                <div className="text-base font-semibold text-foreground">
                  25% Discount on 13,000+ Quality Supplements
                </div>
              </motion.div>
            </motion.div>

            {/* Animated Badge */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2.4 }}
            >
              <Badge className="px-8 py-3 text-base font-medium bg-white/20 text-white border-white/30 rounded-2xl hover:bg-white/30 transition-all duration-300">
                No Subscription • Multiple Labs Per Session • Biohacking Protocols
              </Badge>
            </motion.div>

            {/* Main CTA */}
            <motion.div 
              className="pt-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2.8 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="btn-secondary text-xl px-12 py-6 h-auto group relative overflow-hidden" 
                  onClick={handleGetStarted}
                >
                  <motion.span
                    className="relative z-10 flex items-center"
                  >
                    {user ? 'Access Dashboard' : 'Get Lab Analysis'}
                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </motion.span>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section with Staggered Animation */}
      <section className="py-20 lg:py-32 bg-muted/30 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                All your lab insights,
                <br />
                <span className="text-primary">in one analysis.</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Join 1M+ happy users today.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={TrendingUp}
                title="Comprehensive Analysis"
                description="Upload multiple lab reports in one $19 session and get insights that generic AI tools miss. Our specialized training in cutting-edge biohacking research, functional medicine protocols, and advanced pattern recognition uncovers hidden correlations in your data—complete with visual breakdowns and actionable protocols tailored to optimization, not just 'normal' ranges."
                delay={0}
              />
              
              <FeatureCard
                icon={Zap}
                title="Supplement Access"
                description="Get 25% off professional-grade Fullscript supplements tailored to your lab results. Automated retest reminders and suggested follow-up labs keep you optimizing long-term."
                delay={0.2}
              />
              
              <FeatureCard
                icon={Users}
                title="Optimization-Focused"
                description="Beyond basic 'disease detection'—get biohacking protocols for energy, cognition, longevity. We guide you to affordable lab providers like Jason Health so you focus on optimization, not ordering."
                delay={0.4}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps with Animation */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Simple, fast & safe
              </h2>
              <p className="text-xl text-muted-foreground mb-16">
                Get your comprehensive analysis in 5 simple steps
              </p>
            </motion.div>

            <div className="grid md:grid-cols-5 gap-8">
              {[
                { number: "01", title: "Upload", icon: TrendingUp },
                { number: "02", title: "Analyze", icon: Brain },
                { number: "03", title: "Review", icon: CheckCircle },
                { number: "04", title: "Optimize", icon: Zap },
                { number: "05", title: "Thrive", icon: Heart }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    y: -10,
                    transition: { duration: 0.3 }
                  }}
                >
                  <motion.div 
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-subtle flex items-center justify-center border border-border"
                    whileHover={{ 
                      scale: 1.1,
                      backgroundColor: "rgba(33, 150, 243, 0.1)"
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <step.icon className="h-8 w-8 text-primary" />
                  </motion.div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">{step.number}</div>
                  <div className="text-lg font-semibold text-foreground">{step.title}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 lg:py-32 bg-gradient-subtle relative">        
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-4 mb-8">
              <motion.div 
                className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center"
                whileHover={{ 
                  scale: 1.1, 
                  rotate: 5,
                  boxShadow: "0 10px 30px rgba(33, 150, 243, 0.3)"
                }}
                transition={{ duration: 0.3 }}
              >
                <Shield className="h-8 w-8 text-white" />
              </motion.div>
              <h3 className="text-4xl lg:text-5xl font-bold text-foreground">Clinical Grade Security & Privacy</h3>
            </div>
            
            <p className="text-xl text-muted-foreground leading-relaxed mb-12">
              HIPAA-compliant platform with end-to-end encryption. Your health data is protected with 
              enterprise-grade security standards used by leading healthcare institutions.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Shield, label: "HIPAA Compliant" },
                { icon: CheckCircle, label: "SOC 2 Certified" },
                { icon: Zap, label: "256-bit Encryption" },
                { icon: TrendingUp, label: "FDA Guidelines" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="bg-card rounded-2xl p-6 shadow-md border border-border cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    y: -5
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <item.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  </motion.div>
                  <div className="font-semibold text-foreground">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="gradient-hero py-20 lg:py-32 relative">
        <div className="container mx-auto px-6 text-center">
          <motion.div 
            className="max-w-4xl mx-auto space-y-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
              Stop Guessing.<br />
              <span className="text-white/80">Start Biohacking with Precision.</span>
            </h2>
            
            <p className="text-xl text-white/85 leading-relaxed">
              One $19 session unlocks comprehensive analysis using elite biohacking and functional medicine methodologies + personalized protocols + 25% discount on 13,000+ quality supplement and wellness products.
            </p>
            
            <motion.div 
              className="pt-6"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                className="btn-secondary text-xl px-12 py-6 h-auto group" 
                onClick={handleGetStarted}
              >
                {clinicContext ? 'Access Your Portal' : 'Start Analysis Now'}
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      {!clinicContext && (
        <motion.footer 
          className="py-12 bg-muted/50 border-t border-border"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="container mx-auto px-6">
            <div className="text-center text-muted-foreground">
                <p className="text-lg">
                  Healthcare Provider? 
                  <motion.a 
                    href="/clinic" 
                    className="ml-2 text-primary hover:text-primary-hover transition-colors font-medium"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    Learn about BiohackLabs.ai for Clinics
                  </motion.a>
                </p>
            </div>
          </div>
        </motion.footer>
      )}
    </div>
  );
};

export default AnimatedLandingPage;