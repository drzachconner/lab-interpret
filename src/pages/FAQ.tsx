import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Navigation } from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { 
  HelpCircle, 
  Brain, 
  Shield, 
  CreditCard,
  Microscope,
  ShoppingCart,
  Clock,
  FileText
} from "lucide-react";
import HeroBackground from "@/components/UnifiedBackground";

export default function FAQ() {
  const navigate = useNavigate();
  
  const faqCategories = [
    {
      title: "Analysis & Reports",
      icon: <Brain className="h-5 w-5" />,
      questions: [
        {
          q: "How accurate is the AI analysis?",
          a: "Our AI uses GPT-5 with specialized training in functional medicine ranges and biomarker interpretation. While highly sophisticated, it provides educational insights that should always be reviewed with qualified healthcare providers. The analysis identifies patterns and potential optimization opportunities using functional ranges that often reveal insights missed by conventional 'normal' ranges."
        },
        {
          q: "What lab formats do you accept?",
          a: "We accept PDFs, images (JPEG, PNG), and digital files from all major labs including Quest, LabCorp, and independent laboratories. Our AI can process most standard lab report formats. If you have trouble with a specific format, our support team can help."
        },
        {
          q: "How long does analysis take?",
          a: "Analysis is completed in under 60 seconds for most reports. Complex panels with many biomarkers may take up to 2-3 minutes. You'll receive an email notification when your analysis is ready, and results are immediately available in your dashboard."
        },
        {
          q: "What's the difference between functional and conventional ranges?",
          a: "Conventional lab ranges show what's 'statistically normal' in the general population. Functional ranges identify optimal levels for peak health and performance. For example, B12 above 200 pg/mL is 'normal,' but functional medicine targets above 500 pg/mL for optimal neurological function and energy production."
        },
        {
          q: "Can I upload multiple lab reports?",
          a: "Yes! You can upload multiple reports for comprehensive analysis. Each analysis ($19) can include multiple lab reports from the same time period. We also track changes over time when you upload follow-up labs, showing your optimization progress."
        }
      ]
    },
    {
      title: "Lab Testing", 
      icon: <Microscope className="h-5 w-5" />,
      questions: [
        {
          q: "How do I order lab panels through your platform?",
          a: "Browse our lab marketplace, select your desired panels, and complete checkout. We provide practitioner authorization for all tests. You'll receive lab requisition forms to take to Quest or LabCorp locations. Results are automatically uploaded to your account for AI analysis."
        },
        {
          q: "Do I need a doctor's prescription?",
          a: "No prescription needed! We provide practitioner authorization for all lab panels. This allows you to order comprehensive testing without visiting a doctor first, though we always recommend discussing results with healthcare providers."
        },
        {
          q: "Where can I get blood drawn?",
          a: "At any Quest Diagnostics or LabCorp location nationwide. There are thousands of locations - use their website locators to find the nearest center. Most locations accept walk-ins, though appointments can be scheduled for convenience."
        },
        {
          q: "How long until I get results?",
          a: "Most results are available within 2-3 business days. Complex panels or specialty tests may take 5-7 days. Results are automatically uploaded to your account and analyzed immediately upon receipt."
        },
        {
          q: "What if I need fasting for certain tests?",
          a: "Fasting requirements are clearly marked on each panel and included in your lab requisition. Typically 10-12 hours fasting is required for glucose and lipid panels. We provide detailed preparation instructions with your lab forms."
        },
        {
          q: "Do you accept insurance for lab testing?",
          a: "Lab orders placed through Fullscript are cash-pay only and not reimbursable by insurance (no superbills available). A $12.50 provider authorization fee per test/panel and a $10 standard draw fee are included at checkout. HSA/FSA eligibility varies by plan—please check with your administrator."
        },
        {
          q: "What if I want to use my insurance for labs?",
          a: "If you prefer to use insurance, you can get labs ordered through your doctor or clinician, then upload the PDF results to our platform for $19 AI interpretation. This allows you to leverage your insurance coverage while still getting our advanced functional medicine analysis."
        },
        {
          q: "What happens if my lab order isn't approved?",
          a: "If an authorizing clinician doesn't approve your order for any reason, Fullscript provides a full refund including the $12.50 authorization fee. This ensures you're only charged for approved and completed lab work."
        }
      ]
    },
    {
      title: "Supplements & Fullscript",
      icon: <ShoppingCart className="h-5 w-5" />,
      questions: [
        {
          q: "How do I get the 25% supplement discount?",
          a: "The 25% discount is automatically applied when you access our Fullscript dispensary. After any analysis or lab purchase, you'll gain permanent access to practitioner pricing on 13,000+ professional-grade supplements. No additional steps required - the discount is already applied at checkout."
        },
        {
          q: "What brands are available in the supplement catalog?",
          a: "Our Fullscript dispensary includes top practitioner brands like Thorne, Designs for Health, Pure Encapsulations, Metagenics, Ortho Molecular, Integrative Therapeutics, and many more. All products are pharmaceutical-grade and third-party tested for purity and potency."
        },
        {
          q: "Can I shop supplements without getting analysis?",
          a: "Yes! You can access our supplement dispensary directly for $0 by creating a dispensary account. You'll still receive the same 25% practitioner discount and access to professional-grade supplements without requiring lab analysis."
        },
        {
          q: "How are supplement recommendations determined?",
          a: "Recommendations are based on your specific biomarker patterns, deficiencies identified in analysis, and functional medicine protocols. Our AI considers optimal dosing, timing, and potential interactions to suggest the most appropriate supplements for your individual results."
        },
        {
          q: "What if I'm already taking supplements?",
          a: "Our analysis considers existing supplement regimens when provided. We can identify potential redundancies, suggest optimizations, or recommend adjustments based on your current biomarker status and what you're already taking."
        }
      ]
    },
    {
      title: "Privacy & Security",
      icon: <Shield className="h-5 w-5" />,
      questions: [
        {
          q: "How is my health data protected?",
          a: "All health data is encrypted using AES-256 encryption both in transit and at rest. We use enterprise-grade security infrastructure with SOC 2 compliance, regular security audits, and strict access controls. Your data is never shared without explicit consent."
        },
        {
          q: "Are you HIPAA compliant?",
          a: "We implement enterprise-grade privacy and security measures that meet or exceed HIPAA standards. However, since we provide educational analysis rather than medical services, we are not HIPAA-covered entities. See our privacy policy for complete details on data protection practices."
        },
        {
          q: "Who has access to my lab results?",
          a: "Only you have access to your complete lab results and analysis. Our AI processes the data automatically without human review. We never share individual health information with third parties except authorized partners like Fullscript (for supplement access) with your explicit consent."
        },
        {
          q: "Can I delete my account and data?",
          a: "Yes, you can request complete account deletion at any time. We will permanently remove all your health data, analysis results, and personal information within 30 days of your request. You retain full control over your data at all times."
        }
      ]
    },
    {
      title: "Billing & Payments",
      icon: <CreditCard className="h-5 w-5" />,
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit cards (Visa, MasterCard, American Express, Discover) and debit cards through our secure Stripe payment processing. All transactions are encrypted and secure."
        },
        {
          q: "Is there a subscription or recurring charges?",
          a: "No subscriptions! You only pay per analysis ($19) or per lab panel ordered. There are no monthly fees, hidden charges, or automatic renewals. You maintain full control over when and what you purchase."
        },
        {
          q: "What is your refund policy?",
          a: "Analysis refunds are available within 24 hours if no analysis has been provided due to technical issues. Lab panel refunds depend on processing status - full refunds available before lab requisition is generated. We're committed to resolving any issues promptly."
        },
        {
          q: "Why is analysis so much cheaper than competitors?",
          a: "We've automated the analysis process using advanced AI, eliminating expensive human review costs. Our revenue also comes from supplement partnerships, allowing us to offer analysis at near-cost. We believe health optimization should be accessible, not expensive."
        },
        {
          q: "Are lab fees included in the panel price?",
          a: "The panel price covers the lab testing cost. However, Fullscript adds a $12.50 provider authorization fee per test/panel and a $10 standard draw fee at checkout. These fees are clearly displayed before payment and cover practitioner oversight and sample collection services."
        },
        {
          q: "Can I use HSA/FSA for lab purchases?",
          a: "HSA/FSA eligibility varies by individual plan and administrator policies. While our lab testing may qualify as a medical expense, you should check with your HSA/FSA administrator for specific eligibility. We recommend keeping receipts for potential reimbursement."
        }
      ]
    },
    {
      title: "Getting Started",
      icon: <HelpCircle className="h-5 w-5" />,
      questions: [
        {
          q: "I'm new to functional medicine - where should I start?",
          a: "Start with uploading any existing lab work for analysis ($19) to understand your current status. If you don't have recent labs, consider our Comprehensive Metabolic Panel or Basic Health Panel. Our analysis will explain each biomarker in easy-to-understand language and suggest next steps."
        },
        {
          q: "How often should I retest my labs?",
          a: "Generally every 3-6 months for optimization tracking, though this varies by individual needs and biomarkers being monitored. Our analysis provides specific retest recommendations based on your results and suggested interventions."
        },
        {
          q: "Should I consult with a doctor about my results?",
          a: "Absolutely! While our analysis provides valuable educational insights, we always recommend discussing results and any interventions with qualified healthcare providers. Our reports can serve as excellent conversation starters with your medical team."
        },
        {
          q: "What if my labs show concerning results?",
          a: "Our analysis will flag any biomarkers outside optimal ranges and provide educational context. For any values significantly outside normal ranges or patterns suggesting medical attention, we recommend immediate consultation with healthcare providers. We provide educational insights, not medical diagnosis or treatment."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <HeroBackground variant="hero" intensity="medium" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200 animate-fade-in">
            ❓ Questions & Answers
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-scale-in">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 animate-fade-in">
            Everything you need to know about AI health analysis, lab testing, and supplement optimization
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-blue-600 mr-3">
                      {category.icon}
                    </div>
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`item-${categoryIndex}-${faqIndex}`}>
                        <AccordionTrigger className="text-left">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 leading-relaxed">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Still Have Questions?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Our support team is here to help you get the most out of your health optimization journey
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/contact')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <HelpCircle className="mr-2 h-5 w-5" />
              Contact Support
            </Button>
            <Button 
              size="lg"
              variant="outline" 
              onClick={() => navigate('/auth')}
            >
              <FileText className="mr-2 h-5 w-5" />
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Health Optimization?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Upload existing labs or order comprehensive testing to begin
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