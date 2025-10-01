import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Stethoscope, Users, Zap, TrendingUp, Shield, Clock } from "lucide-react";

const ClinicLanding = () => {
  const navigate = useNavigate();
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  const plans = [
    {
      name: "Basic",
      price: "$199",
      period: "/month",
      description: "Perfect for small practices",
      features: [
        "Up to 100 patient analyses/month", 
        "Basic AI lab interpretation",
        "Fullscript integration", 
        "Custom branding",
        "Email support"
      ],
      cta: "Start 14-Day Free Trial",
      popular: false
    },
    {
      name: "Premium", 
      price: "$399",
      period: "/month",
      description: "For growing practices",
      features: [
        "Up to 500 patient analyses/month",
        "Advanced AI recommendations", 
        "Priority Fullscript integration",
        "Full white-label customization",
        "Phone & email support",
        "Analytics dashboard"
      ],
      cta: "Start 14-Day Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "$799", 
      period: "/month",
      description: "For multi-location practices",
      features: [
        "Unlimited patient analyses",
        "Custom AI model training",
        "Multi-location management", 
        "API access",
        "Dedicated account manager",
        "Custom integrations"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const benefits = [
    {
      icon: <Stethoscope className="h-6 w-6 text-primary" />,
      title: "AI-Powered Lab Analysis", 
      description: "Advanced algorithms provide accurate, personalized interpretations of patient lab work"
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Seamless Patient Experience",
      description: "Patients upload labs and receive instant, comprehensive health insights with supplement recommendations"
    },
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "Fullscript Integration", 
      description: "Direct links to your dispensary for recommended supplements - increase revenue effortlessly"
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-primary" />,
      title: "Revenue Growth",
      description: "Turn lab results into supplement sales with personalized recommendations linked to your dispensary"
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "HIPAA Compliant",
      description: "Enterprise-grade security ensures patient data is protected and compliant"
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Time Savings",
      description: "Reduce time spent on lab interpretation while providing better patient care"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                LabPilot Pro
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate("/clinic-login")}>
                Sign In
              </Button>
              <Button onClick={() => navigate("/clinic-signup")}>
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium">
            Trusted by 500+ Chiropractic Clinics
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Transform Lab Results into 
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent"> Revenue</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            White-label AI lab analysis platform that turns patient lab work into personalized supplement recommendations, 
            driving revenue through your Fullscript dispensary.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 py-3 text-lg" onClick={() => navigate("/clinic-signup")}>
              Start 14-Day Free Trial
              <TrendingUp className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg" onClick={() => navigate("/pricing")}>
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-subtle">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to Scale Your Practice
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed specifically for chiropractic practices
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-elegant hover:shadow-glow transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="mb-3">
                    {benefit.icon}
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {benefit.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose the plan that fits your practice size
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index}
                className={`relative transition-all duration-300 ${
                  plan.popular 
                    ? "border-primary shadow-glow scale-105" 
                    : "hover:shadow-elegant"
                } ${hoveredPlan === plan.name ? "scale-105" : ""}`}
                onMouseEnter={() => setHoveredPlan(plan.name)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => navigate("/clinic-signup")}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-primary text-white">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of chiropractic clinics already using LabPilot Pro to increase revenue 
            and provide better patient care.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="px-8 py-3 text-lg bg-white text-primary hover:bg-white/90"
            onClick={() => navigate("/clinic-signup")}
          >
            Start Your Free Trial Today
          </Button>
          <p className="text-sm mt-4 opacity-75">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-background border-t">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="h-6 w-6 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">LabPilot Pro</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 LabPilot Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ClinicLanding;