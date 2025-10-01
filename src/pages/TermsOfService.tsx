import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import HeroBackground from "@/components/UnifiedBackground";

export default function TermsOfService() {
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
          <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200">
            📋 Legal Terms
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Terms of Service
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                BiohackLabs.ai Terms of Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-8">
                  {/* Acceptance */}
                  <section>
                    <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
                    <p className="text-gray-700 mb-4">
                      By accessing and using BiohackLabs.ai ("Service," "we," "us," or "our"), you accept and agree to be bound by the terms and provision of this agreement.
                    </p>
                    <p className="text-gray-700">
                      If you do not agree to abide by the above, please do not use this service.
                    </p>
                  </section>

                  <Separator />

                  {/* Medical Disclaimer */}
                  <section>
                    <h2 className="text-xl font-semibold mb-4">2. Medical Disclaimer</h2>
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
                      <p className="text-amber-800 font-medium">
                        ⚠️ IMPORTANT: BiohackLabs.ai is NOT a medical service and does not provide medical advice.
                      </p>
                    </div>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>Our AI analysis is for educational and informational purposes only</li>
                      <li>Results should not be used as a substitute for professional medical advice</li>
                      <li>Always consult with a qualified healthcare provider before making health decisions</li>
                      <li>We do not diagnose, treat, cure, or prevent any disease</li>
                      <li>Lab results require interpretation by qualified medical professionals</li>
                    </ul>
                  </section>

                  <Separator />

                  {/* Service Description */}
                  <section>
                    <h2 className="text-xl font-semibold mb-4">3. Service Description</h2>
                    <p className="text-gray-700 mb-4">BiohackLabs.ai provides:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>AI-powered analysis of laboratory reports using functional medicine ranges</li>
                      <li>Educational supplement recommendations based on analysis</li>
                      <li>Access to practitioner-grade supplements through third-party partners</li>
                      <li>Progress tracking and retest reminders</li>
                    </ul>
                  </section>

                  <Separator />

                  {/* User Responsibilities */}
                  <section>
                    <h2 className="text-xl font-semibold mb-4">4. User Responsibilities</h2>
                    <p className="text-gray-700 mb-4">By using our service, you agree to:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>Provide accurate and complete information</li>
                      <li>Use the service for personal, non-commercial purposes only</li>
                      <li>Not share your account credentials with others</li>
                      <li>Consult healthcare providers before implementing any recommendations</li>
                      <li>Not rely solely on our analysis for health decisions</li>
                    </ul>
                  </section>

                  <Separator />

                  {/* Privacy and Data */}
                  <section>
                    <h2 className="text-xl font-semibold mb-4">5. Privacy and Data Protection</h2>
                    <p className="text-gray-700 mb-4">
                      We take your privacy seriously and implement industry-standard security measures to protect your data.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>All health data is encrypted and stored securely</li>
                      <li>We comply with applicable privacy laws and regulations</li>
                      <li>Data is only shared with explicitly authorized third parties</li>
                      <li>You retain ownership of your health data</li>
                      <li>See our Privacy Policy for complete details</li>
                    </ul>
                  </section>

                  <Separator />

                  {/* Payments and Refunds */}
                  <section>
                    <h2 className="text-xl font-semibold mb-4">6. Payments and Refunds</h2>
                    <div className="space-y-4 text-gray-700">
                      <div>
                        <h3 className="font-medium mb-2">Payment Terms:</h3>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Analysis fees are charged per report ($19)</li>
                          <li>Lab panel fees vary by selected tests</li>
                          <li>All payments are processed securely through Stripe</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">Refund Policy:</h3>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Analysis refunds available within 24 hours if no analysis provided</li>
                          <li>Lab panel refunds subject to lab provider policies</li>
                          <li>Technical issues will be resolved or refunded promptly</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  <Separator />

                  {/* Limitations of Liability */}
                  <section>
                    <h2 className="text-xl font-semibold mb-4">7. Limitations of Liability</h2>
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                      <p className="text-red-800 font-medium">
                        IMPORTANT LIABILITY LIMITATIONS
                      </p>
                    </div>
                    <p className="text-gray-700 mb-4">
                      To the fullest extent permitted by law, BiohackLabs.ai shall not be liable for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>Any direct, indirect, incidental, or consequential damages</li>
                      <li>Health decisions made based on our analysis</li>
                      <li>Accuracy of third-party lab results or supplement information</li>
                      <li>Service interruptions or technical issues</li>
                      <li>Any damages exceeding the amount paid for our services</li>
                    </ul>
                  </section>

                  <Separator />

                  {/* Termination */}
                  <section>
                    <h2 className="text-xl font-semibold mb-4">8. Termination</h2>
                    <p className="text-gray-700 mb-4">
                      Either party may terminate this agreement at any time:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>You may delete your account and discontinue use</li>
                      <li>We may terminate accounts for violations of these terms</li>
                      <li>Upon termination, access to the service will be discontinued</li>
                      <li>Data retention follows our Privacy Policy guidelines</li>
                    </ul>
                  </section>

                  <Separator />

                  {/* Changes to Terms */}
                  <section>
                    <h2 className="text-xl font-semibold mb-4">9. Changes to Terms</h2>
                    <p className="text-gray-700">
                      We reserve the right to modify these terms at any time. Users will be notified of material changes via email or service notifications. Continued use of the service after changes constitutes acceptance of new terms.
                    </p>
                  </section>

                  <Separator />

                  {/* Contact Information */}
                  <section>
                    <h2 className="text-xl font-semibold mb-4">10. Contact Information</h2>
                    <p className="text-gray-700 mb-4">
                      For questions about these Terms of Service, please contact us:
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">Email: legal@biohacklabs.ai</p>
                      <p className="text-gray-700">Support: support@biohacklabs.ai</p>
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