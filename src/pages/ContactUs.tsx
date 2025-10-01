import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  MessageCircle, 
  Phone,
  Clock,
  HelpCircle,
  Bug,
  CreditCard,
  Shield,
  Send
} from "lucide-react";
import HeroBackground from "@/components/UnifiedBackground";

export default function ContactUs() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Support",
      description: "Get detailed help via email",
      contact: "support@biohacklabs.ai",
      responseTime: "Within 4-6 hours"
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "General Questions", 
      description: "Questions about our services",
      contact: "hello@biohacklabs.ai",
      responseTime: "Within 24 hours"
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Billing Support",
      description: "Payment and billing inquiries", 
      contact: "billing@biohacklabs.ai",
      responseTime: "Within 2-4 hours"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Privacy & Security",
      description: "Data privacy and security concerns",
      contact: "privacy@biohacklabs.ai", 
      responseTime: "Within 48 hours"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent Successfully!",
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({
        name: "",
        email: "", 
        category: "",
        subject: "",
        message: ""
      });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <HeroBackground variant="hero" intensity="medium" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200 animate-fade-in">
            💬 Get in Touch
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-scale-in">
            Contact{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Support
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 animate-fade-in">
            Need help with your analysis, have questions, or want to provide feedback? 
            We're here to help optimize your health journey.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Can We Help?
            </h2>
            <p className="text-xl text-gray-600">
              Choose the best way to reach us based on your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactMethods.map((method, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all hover-scale">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                    {method.icon}
                  </div>
                  <CardTitle className="text-lg">{method.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-gray-600 text-sm">{method.description}</p>
                  <p className="text-blue-600 font-medium text-sm">{method.contact}</p>
                  <div className="flex items-center justify-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {method.responseTime}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Send Us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(value) => handleInputChange('category', value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select inquiry type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">
                        <div className="flex items-center">
                          <HelpCircle className="h-4 w-4 mr-2" />
                          General Question
                        </div>
                      </SelectItem>
                      <SelectItem value="technical">
                        <div className="flex items-center">
                          <Bug className="h-4 w-4 mr-2" />
                          Technical Issue
                        </div>
                      </SelectItem>
                      <SelectItem value="billing">
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Billing Support
                        </div>
                      </SelectItem>
                      <SelectItem value="privacy">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-2" />
                          Privacy/Security
                        </div>
                      </SelectItem>
                      <SelectItem value="analysis">
                        <div className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Analysis Question
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="Brief description of your inquiry"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Please provide details about your question or issue. The more information you provide, the better we can help you."
                    className="min-h-[120px]"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Link */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Looking for Quick Answers?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Check our comprehensive FAQ section for instant answers to common questions
          </p>
          
          <Button 
            size="lg"
            variant="outline"
            onClick={() => navigate('/faq')}
            className="border-blue-200 hover:bg-blue-50"
          >
            <HelpCircle className="mr-2 h-5 w-5" />
            Browse FAQ
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Optimize Your Health?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Don't wait - start your health optimization journey today
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/auth?type=analysis')}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Upload Labs ($19)
            </Button>
            <Button 
              size="lg" 
              onClick={() => navigate('/lab-marketplace')}
              className="bg-white text-primary hover:bg-gray-100 border-white"
            >
              Order Lab Panels
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}