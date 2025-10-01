import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Lock, Eye, FileText, Users, Globe } from "lucide-react";
import HeroBackground from "@/components/UnifiedBackground";

export default function PrivacyPolicy() {
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
          <Badge className="mb-6 bg-green-100 text-green-800 border-green-200">
            🔒 Privacy Policy
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Privacy Policy
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </section>

      {/* Privacy Summary Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Privacy at a Glance
            </h2>
            <p className="text-xl text-gray-600">
              Key principles of how we protect your data
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-all hover-scale">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center text-green-600 mb-4">
                  <Lock className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Encrypted & Secure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">All health data encrypted with AES-256. Enterprise-grade security infrastructure.</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all hover-scale">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                  <Eye className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Your Data, Your Control</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">Access, modify, or delete your data anytime. Full transparency and user control.</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all hover-scale">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                  <Shield className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Never Sold</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">Your health data is never sold to advertisers, insurance companies, or data brokers.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Full Privacy Policy */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Complete Privacy Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-8">
                  {/* Introduction */}
                  <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-600" />
                      Introduction
                    </h2>
                    <p className="text-gray-700 mb-4">
                      BiohackLabs.ai ("we," "our," or "us") is committed to protecting your privacy and the security of your personal health information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
                    </p>
                    <p className="text-gray-700">
                      By using BiohackLabs.ai, you consent to the data practices described in this policy.
                    </p>
                  </section>

                  <Separator />

                  {/* Information We Collect */}
                  <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-green-600" />
                      Information We Collect
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Personal Information:</h3>
                        <ul className="list-disc pl-6 space-y-1 text-gray-700">
                          <li>Name and email address (for account creation)</li>
                          <li>Payment information (processed securely by Stripe)</li>
                          <li>Communication preferences and support interactions</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Health Information:</h3>
                        <ul className="list-disc pl-6 space-y-1 text-gray-700">
                          <li>Laboratory test results you voluntarily upload</li>
                          <li>Health questionnaire responses (if provided)</li>
                          <li>Analysis results and recommendations generated by our AI</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Usage Information:</h3>
                        <ul className="list-disc pl-6 space-y-1 text-gray-700">
                          <li>Service usage patterns and feature interactions</li>
                          <li>Device information and browser details</li>
                          <li>IP address and general location data</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  <Separator />

                  {/* How We Use Information */}
                  <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <Globe className="h-5 w-5 mr-2 text-purple-600" />
                      How We Use Your Information
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Primary Uses:</h3>
                        <ul className="list-disc pl-6 space-y-1 text-gray-700">
                          <li>Generate AI-powered analysis of your laboratory results</li>
                          <li>Provide personalized supplement and lifestyle recommendations</li>
                          <li>Track your health progress over time</li>
                          <li>Send retest reminders and health insights</li>
                          <li>Facilitate access to practitioner-grade supplements</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Service Improvement:</h3>
                        <ul className="list-disc pl-6 space-y-1 text-gray-700">
                          <li>Analyze usage patterns to improve our service (anonymized data only)</li>
                          <li>Enhance AI analysis algorithms using aggregated, de-identified data</li>
                          <li>Respond to customer support requests and technical issues</li>
                          <li>Send important service updates and security notifications</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  <Separator />

                  {/* Information Sharing */}
                  <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-amber-600" />
                      Information Sharing and Disclosure
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="bg-green-50 border-l-4 border-green-400 p-4">
                        <h3 className="font-medium text-green-800 mb-2">✅ We DO share data with:</h3>
                        <ul className="list-disc pl-6 space-y-1 text-green-700">
                          <li><strong>Fullscript:</strong> For supplement recommendations and purchasing (with your explicit consent)</li>
                          <li><strong>Lab Partners:</strong> Quest/LabCorp for test ordering when you purchase lab panels</li>
                          <li><strong>Payment Processors:</strong> Stripe for secure payment processing</li>
                          <li><strong>Service Providers:</strong> Trusted partners who help operate our service (under strict confidentiality)</li>
                          <li><strong>Legal Requirements:</strong> When required by law, court order, or regulatory compliance</li>
                        </ul>
                      </div>
                      
                      <div className="bg-red-50 border-l-4 border-red-400 p-4">
                        <h3 className="font-medium text-red-800 mb-2">❌ We NEVER share data for:</h3>
                        <ul className="list-disc pl-6 space-y-1 text-red-700">
                          <li>Marketing or advertising to third parties</li>
                          <li>Sale to data brokers or aggregators</li>
                          <li>Insurance company reporting or underwriting</li>
                          <li>Employment screening or background checks</li>
                          <li>Any commercial purposes not directly related to your health optimization</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  <Separator />

                  {/* Data Security */}
                  <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <Lock className="h-5 w-5 mr-2 text-blue-600" />
                      Data Security and Protection
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Technical Safeguards:</h3>
                        <ul className="list-disc pl-6 space-y-1 text-gray-700">
                          <li>AES-256 encryption for data at rest and in transit</li>
                          <li>TLS 1.3 encryption for all web communications</li>
                          <li>Multi-factor authentication for account access</li>
                          <li>Regular security audits and penetration testing</li>
                          <li>SOC 2 compliant hosting infrastructure</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Administrative Safeguards:</h3>
                        <ul className="list-disc pl-6 space-y-1 text-gray-700">
                          <li>Role-based access controls for employee data access</li>
                          <li>Regular security training for all team members</li>
                          <li>Comprehensive audit logging of all system access</li>
                          <li>Incident response procedures for security breaches</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  <Separator />

                  {/* Your Rights */}
                  <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <Eye className="h-5 w-5 mr-2 text-purple-600" />
                      Your Privacy Rights
                    </h2>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 mb-4">You have the following rights regarding your personal data:</p>
                      <ul className="list-disc pl-6 space-y-2 text-blue-700">
                        <li><strong>Access:</strong> Request a copy of all personal data we hold about you</li>
                        <li><strong>Rectification:</strong> Correct any inaccurate or incomplete information</li>
                        <li><strong>Erasure:</strong> Request deletion of your account and all associated data</li>
                        <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                        <li><strong>Restriction:</strong> Limit how we process your data</li>
                        <li><strong>Objection:</strong> Object to certain types of data processing</li>
                        <li><strong>Withdraw Consent:</strong> Revoke previously given consent at any time</li>
                      </ul>
                    </div>
                  </section>

                  <Separator />

                  {/* Data Retention */}
                  <section>
                    <h2 className="text-xl font-semibold mb-4">Data Retention</h2>
                    <div className="space-y-3 text-gray-700">
                      <p><strong>Active Accounts:</strong> We retain your data as long as your account is active or as needed to provide services.</p>
                      <p><strong>Inactive Accounts:</strong> Data is automatically deleted after 3 years of account inactivity.</p>
                      <p><strong>Legal Requirements:</strong> Some data may be retained longer to comply with legal obligations.</p>
                      <p><strong>Immediate Deletion:</strong> You can request immediate account and data deletion at any time.</p>
                    </div>
                  </section>

                  <Separator />

                  {/* International Transfers */}
                  <section>
                    <h2 className="text-xl font-semibold mb-4">International Data Transfers</h2>
                    <p className="text-gray-700 mb-4">
                      Your data is processed in the United States. If you are located outside the US, your data will be transferred to and processed in the United States, which may have different data protection laws than your country.
                    </p>
                    <p className="text-gray-700">
                      We ensure appropriate safeguards are in place for international transfers through standard contractual clauses and other legally recognized transfer mechanisms.
                    </p>
                  </section>

                  <Separator />

                  {/* Cookies and Tracking */}
                  <section>
                    <h2 className="text-xl font-semibold mb-4">Cookies and Tracking Technologies</h2>
                    <div className="space-y-3 text-gray-700">
                      <p><strong>Essential Cookies:</strong> Required for service functionality (login, security, preferences)</p>
                      <p><strong>Analytics Cookies:</strong> Help us understand service usage patterns (anonymized)</p>
                      <p><strong>No Advertising Tracking:</strong> We do not use cookies for advertising or marketing tracking</p>
                      <p><strong>Cookie Control:</strong> You can manage cookie preferences through your browser settings</p>
                    </div>
                  </section>

                  <Separator />

                  {/* Children's Privacy */}
                  <section>
                    <h2 className="text-xl font-semibold mb-4">Children's Privacy</h2>
                    <p className="text-gray-700">
                      BiohackLabs.ai is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If you become aware that a child has provided us with personal information, please contact us immediately.
                    </p>
                  </section>

                  <Separator />

                  {/* Changes to Policy */}
                  <section>
                    <h2 className="text-xl font-semibold mb-4">Changes to This Privacy Policy</h2>
                    <p className="text-gray-700 mb-4">
                      We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. We will notify you of material changes via:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-gray-700">
                      <li>Email notification to your registered address</li>
                      <li>Prominent notice on our website and service</li>
                      <li>In-app notifications for significant changes</li>
                    </ul>
                  </section>

                  <Separator />

                  {/* Contact Information */}
                  <section>
                    <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
                    <p className="text-gray-700 mb-4">
                      If you have questions about this Privacy Policy or wish to exercise your privacy rights:
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">Email: privacy@biohacklabs.ai</p>
                      <p className="text-gray-700">Subject: Privacy Inquiry</p>
                      <p className="text-gray-700">Response Time: Within 48 hours</p>
                    </div>
                  </section>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}