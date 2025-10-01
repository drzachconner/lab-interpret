import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Stethoscope, Brain, Shield, FileText } from "lucide-react";
import HeroBackground from "@/components/UnifiedBackground";

export default function MedicalDisclaimer() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Button variant="ghost" onClick={() => navigate('/')} className="p-2">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BiohackLabs.ai
              </span>
            </Button>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <HeroBackground variant="minimal" intensity="low" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-amber-100 text-amber-800 border-amber-200">
            ⚠️ Medical Information
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Medical Disclaimer
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Important information about our educational services
          </p>
        </div>
      </section>

      {/* Critical Warning */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="space-y-2">
                <p className="font-bold text-lg">
                  🚨 CRITICAL: This is NOT Medical Advice
                </p>
                <p>
                  BiohackLabs.ai provides educational information only. We are not healthcare providers, 
                  do not practice medicine, and cannot replace professional medical care. Always consult 
                  qualified healthcare professionals for medical decisions.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Disclaimer Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center flex items-center justify-center">
                <Stethoscope className="h-6 w-6 mr-2 text-red-600" />
                Medical Disclaimer & Service Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* What We Are NOT */}
              <section>
                <h3 className="text-xl font-semibold mb-4 flex items-center text-red-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  What BiohackLabs.ai is NOT
                </h3>
                <div className="bg-red-50 border-l-4 border-red-400 p-6">
                  <ul className="list-disc pl-6 space-y-2 text-red-800">
                    <li><strong>Not a medical service:</strong> We do not practice medicine or provide healthcare</li>
                    <li><strong>Not diagnostic:</strong> We cannot diagnose, treat, cure, or prevent any disease</li>
                    <li><strong>Not medical advice:</strong> Our analysis is educational information only</li>
                    <li><strong>Not emergency care:</strong> Do not use for urgent medical situations</li>
                    <li><strong>Not replacement care:</strong> Cannot substitute for professional medical consultation</li>
                  </ul>
                </div>
              </section>

              <Separator />

              {/* What We Provide */}
              <section>
                <h3 className="text-xl font-semibold mb-4 flex items-center text-blue-600">
                  <Brain className="h-5 w-5 mr-2" />
                  What BiohackLabs.ai Provides
                </h3>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
                  <ul className="list-disc pl-6 space-y-2 text-blue-800">
                    <li><strong>Educational analysis:</strong> AI-powered interpretation using functional medicine ranges</li>
                    <li><strong>Information resources:</strong> Educational content about lab markers and optimization</li>
                    <li><strong>Supplement guidance:</strong> Educational information about nutritional supplements</li>
                    <li><strong>Progress tracking:</strong> Tools to monitor changes in your lab values over time</li>
                    <li><strong>Research references:</strong> Links to relevant scientific literature</li>
                  </ul>
                </div>
              </section>

              <Separator />

              {/* Professional Consultation Required */}
              <section>
                <h3 className="text-xl font-semibold mb-4 flex items-center text-green-600">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  When to Consult Healthcare Professionals
                </h3>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">Always Consult Professionals For:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-green-700">
                      <li>Interpreting any laboratory results</li>
                      <li>Making decisions about supplements or medications</li>
                      <li>Changes to your health regimen</li>
                      <li>Any concerning symptoms or health changes</li>
                      <li>Before starting any new treatment protocol</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 mb-2">Seek Immediate Medical Care For:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-red-700">
                      <li>Emergency medical situations</li>
                      <li>Severe symptoms or acute illness</li>
                      <li>Medication adverse reactions</li>
                      <li>Any life-threatening conditions</li>
                    </ul>
                  </div>
                </div>
              </section>

              <Separator />

              {/* AI Limitations */}
              <section>
                <h3 className="text-xl font-semibold mb-4 flex items-center text-purple-600">
                  <Brain className="h-5 w-5 mr-2" />
                  AI Analysis Limitations
                </h3>
                <div className="bg-purple-50 border-l-4 border-purple-400 p-6">
                  <p className="text-purple-800 mb-4">
                    Our AI analysis has important limitations you should understand:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-purple-700">
                    <li>AI cannot replace clinical judgment and medical training</li>
                    <li>Analysis is based on patterns, not individual medical context</li>
                    <li>May not account for medications, medical conditions, or individual factors</li>
                    <li>Functional ranges may differ from medical diagnostic criteria</li>
                    <li>Results should always be reviewed by qualified healthcare providers</li>
                  </ul>
                </div>
              </section>

              <Separator />

              {/* Supplement Disclaimers */}
              <section>
                <h3 className="text-xl font-semibold mb-4 flex items-center text-amber-600">
                  <Shield className="h-5 w-5 mr-2" />
                  Supplement & Product Disclaimers
                </h3>
                <div className="space-y-4">
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      <strong>FDA Statement:</strong> These statements have not been evaluated by the Food and Drug Administration. 
                      These products are not intended to diagnose, treat, cure, or prevent any disease.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                    <ul className="list-disc pl-6 space-y-2 text-amber-700">
                      <li>Supplement recommendations are educational suggestions only</li>
                      <li>Individual responses to supplements vary significantly</li>
                      <li>Consult healthcare providers before starting any supplements</li>
                      <li>May interact with medications or medical conditions</li>
                      <li>Pregnancy, nursing, and medical conditions require professional guidance</li>
                    </ul>
                  </div>
                </div>
              </section>

              <Separator />

              {/* Liability Limitations */}
              <section>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Liability & Responsibility
                </h3>
                <div className="bg-gray-50 border-l-4 border-gray-400 p-6">
                  <p className="text-gray-700 mb-4">
                    By using BiohackLabs.ai, you acknowledge and agree that:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>You are responsible for all health decisions and their consequences</li>
                    <li>BiohackLabs.ai is not liable for any health outcomes or decisions</li>
                    <li>You will consult healthcare professionals for medical guidance</li>
                    <li>Our analysis is not a substitute for professional medical care</li>
                    <li>You use our service at your own risk and discretion</li>
                  </ul>
                </div>
              </section>

              <Separator />

              {/* Emergency Information */}
              <section>
                <h3 className="text-xl font-semibold mb-4 flex items-center text-red-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Emergency Information
                </h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <p className="text-red-800 font-medium mb-4">
                    🚨 BiohackLabs.ai is NOT for medical emergencies
                  </p>
                  <div className="space-y-2 text-red-700">
                    <p><strong>In emergencies:</strong> Call 911 (US) or your local emergency number</p>
                    <p><strong>For urgent care:</strong> Contact your healthcare provider immediately</p>
                    <p><strong>Poison control:</strong> 1-800-222-1222 (US)</p>
                    <p><strong>Crisis support:</strong> 988 Suicide & Crisis Lifeline (US)</p>
                  </div>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Understanding CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Learn More About Your Health?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Use our educational analysis as a starting point for discussions with your healthcare provider
          </p>
          
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate('/auth')}
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            <Brain className="mr-2 h-5 w-5" />
            Get Educational Analysis
          </Button>
          
          <p className="text-sm text-blue-200 mt-4">
            Remember: Always consult healthcare professionals for medical decisions
          </p>
        </div>
      </section>
    </div>
  );
}