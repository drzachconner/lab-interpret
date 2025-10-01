import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, Eye, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import HeroBackground from "@/components/UnifiedBackground";

export default function HIPAACompliance() {
  const navigate = useNavigate();
  
  const securityMeasures = [
    {
      icon: <Lock className="h-6 w-6" />,
      title: "End-to-End Encryption",
      description: "All health data is encrypted in transit and at rest using AES-256 encryption"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure Infrastructure", 
      description: "Hosted on SOC 2 compliant infrastructure with regular security audits"
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Access Controls",
      description: "Strict authentication and authorization controls limit data access"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Audit Logging",
      description: "Comprehensive audit trails track all system access and data modifications"
    }
  ];

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
          <Badge className="mb-6 bg-green-100 text-green-800 border-green-200">
            🔒 Privacy & Security
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Privacy & Security Practices
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            How we protect your health information and ensure data privacy
          </p>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Important Notice:</strong> BiohackLabs.ai implements enterprise-grade security measures to protect your health information. 
              While we maintain industry-standard privacy practices, we are not HIPAA-covered entities as we do not provide medical services. 
              For questions about healthcare privacy regulations, consult with qualified legal professionals.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Security Measures */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Enterprise-Grade Security
            </h2>
            <p className="text-xl text-gray-600">
              Your health data is protected by industry-leading security measures
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {securityMeasures.map((measure, index) => (
              <Card key={index} className="hover:shadow-lg transition-all hover-scale">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center text-green-600">
                      {measure.icon}
                    </div>
                    <CardTitle className="text-lg">{measure.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{measure.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Practices */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center flex items-center justify-center">
                <Shield className="h-6 w-6 mr-2 text-green-600" />
                Privacy & Data Protection Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Data Collection */}
              <section>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  What Data We Collect
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Laboratory test results you voluntarily upload</li>
                  <li>Basic account information (email, name)</li>
                  <li>Usage analytics to improve our service</li>
                  <li>Payment information (processed securely by Stripe)</li>
                </ul>
              </section>

              <Separator />

              {/* Data Use */}
              <section>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  How We Use Your Data
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Generate AI-powered functional medicine analysis</li>
                  <li>Provide personalized supplement recommendations</li>
                  <li>Track your progress over time</li>
                  <li>Improve our analysis algorithms (anonymized data only)</li>
                  <li>Send retest reminders and health insights</li>
                </ul>
              </section>

              <Separator />

              {/* Data Sharing */}
              <section>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  Data Sharing & Third Parties
                </h3>
                <div className="space-y-4">
                  <div className="bg-green-50 border-l-4 border-green-400 p-4">
                    <p className="text-green-800 font-medium mb-2">
                      ✅ We DO share data with:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-green-700">
                      <li>Fullscript (for supplement recommendations, with your consent)</li>
                      <li>Lab partners (for test ordering, when you order labs)</li>
                      <li>Payment processors (Stripe, for transaction processing)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <p className="text-red-800 font-medium mb-2">
                      ❌ We NEVER share data for:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-red-700">
                      <li>Marketing or advertising purposes</li>
                      <li>Sale to data brokers or third parties</li>
                      <li>Insurance company reporting</li>
                      <li>Employment screening</li>
                    </ul>
                  </div>
                </div>
              </section>

              <Separator />

              {/* Your Rights */}
              <section>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  Your Data Rights
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Access:</strong> View all data we have about you</li>
                  <li><strong>Correction:</strong> Update inaccurate information</li>
                  <li><strong>Deletion:</strong> Request complete account and data removal</li>
                  <li><strong>Portability:</strong> Export your data in standard formats</li>
                  <li><strong>Consent Withdrawal:</strong> Revoke permissions at any time</li>
                </ul>
              </section>

              <Separator />

              {/* Technical Safeguards */}
              <section>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  Technical Safeguards
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Encryption:</h4>
                    <ul className="list-disc pl-6 text-sm text-gray-700">
                      <li>AES-256 encryption at rest</li>
                      <li>TLS 1.3 for data in transit</li>
                      <li>Encrypted database backups</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Access Controls:</h4>
                    <ul className="list-disc pl-6 text-sm text-gray-700">
                      <li>Multi-factor authentication</li>
                      <li>Role-based access controls</li>
                      <li>Regular access reviews</li>
                    </ul>
                  </div>
                </div>
              </section>

              <Separator />

              {/* Contact */}
              <section>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  Privacy Contact
                </h3>
                <p className="text-gray-700 mb-4">
                  For privacy-related questions, data requests, or security concerns:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">Email: privacy@biohacklabs.ai</p>
                  <p className="text-gray-700">Security: security@biohacklabs.ai</p>
                  <p className="text-gray-700">Response time: Within 48 hours</p>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Your Privacy is Our Priority
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Secure, private health analysis you can trust
          </p>
          
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate('/auth')}
            className="bg-white text-green-600 hover:bg-gray-100"
          >
            <Shield className="mr-2 h-5 w-5" />
            Get Started Securely
          </Button>
        </div>
      </section>
    </div>
  );
}