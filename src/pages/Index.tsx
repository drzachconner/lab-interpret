import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp, DollarSign, Pill, CheckCircle, Brain, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Proprietary AI Trained in Functional Medicine
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Unlock Your Lab Results with Custom AI Analysis
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Our proprietary AI engine is specifically trained in functional medicine, biohacking, 
            and longevity optimization. Get personalized insights using functional ranges - 
            not just standard reference ranges.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8">
                Get Started - Only $19
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button variant="outline" size="lg" className="text-lg px-8">
                See Sample Report
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Advanced AI Trained for Optimal Health
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Unlike standard lab analysis that only flags disease states, our custom AI evaluates 
            your biomarkers against functional medicine ranges for optimal health and performance.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardHeader>
                <Brain className="h-10 w-10 text-purple-600 mb-2" />
                <CardTitle>Functional Medicine AI</CardTitle>
              </CardHeader>
              <CardContent>
                Trained on thousands of functional medicine protocols and optimal ranges 
                used by leading longevity experts
              </CardContent>
            </Card>
            
            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardHeader>
                <Shield className="h-10 w-10 text-green-600 mb-2" />
                <CardTitle>Biohacking Optimized</CardTitle>
              </CardHeader>
              <CardContent>
                Goes beyond "normal" to identify opportunities for optimization in 
                energy, cognition, and performance
              </CardContent>
            </Card>
            
            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardHeader>
                <Sparkles className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Personalized Protocols</CardTitle>
              </CardHeader>
              <CardContent>
                Generates customized supplement and lifestyle recommendations based 
                on your unique biomarker patterns
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Simple 4-Step Process
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <FileUp className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>1. Upload Labs</CardTitle>
              </CardHeader>
              <CardContent>
                Upload your existing lab results in PDF or image format
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <DollarSign className="h-10 w-10 text-green-600 mb-2" />
                <CardTitle>2. Pay $19</CardTitle>
              </CardHeader>
              <CardContent>
                One-time fee for comprehensive functional analysis
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CheckCircle className="h-10 w-10 text-purple-600 mb-2" />
                <CardTitle>3. Get Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                Receive interactive visual report with actionable insights
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Pill className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>4. Save 25%</CardTitle>
              </CardHeader>
              <CardContent>
                Get personalized supplements at exclusive practitioner pricing
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Visual Reports</CardTitle>
            </CardHeader>
            <CardContent>
              Beautiful, easy-to-understand charts and graphs showing your health status
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Functional Ranges</CardTitle>
            </CardHeader>
            <CardContent>
              Analysis based on optimal functional ranges, not just disease markers
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Direct Supplement Links</CardTitle>
            </CardHeader>
            <CardContent>
              One-click access to recommended supplements with automatic 25% discount
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Optimize Your Health?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands using functional medicine AI to unlock their full potential
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8" variant="secondary">
              Upload Your Labs Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;