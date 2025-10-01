import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Upload, Brain, ShoppingCart, Star, TrendingUp, Users, Shield, LogIn, ChevronDown, User, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import HeroFX from "./UnifiedBackground";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

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

const LandingPage = ({ clinicContext }: LandingPageProps = {}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, skipSnaps: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [topBannerRef, topBannerApi] = useEmblaCarousel({ loop: true, skipSnaps: false });
  const [topBannerIndex, setTopBannerIndex] = useState(0);

  // Auto-scroll for top banner
  useEffect(() => {
    if (topBannerApi) {
      const autoplay = setInterval(() => {
        topBannerApi.scrollNext();
      }, 4000);
      return () => clearInterval(autoplay);
    }
  }, [topBannerApi]);

  // Top announcement messages
  const announcementMessages = [
    {
      text: "🔥 Limited Time: Save 60% on Premium Lab Panels",
      link: "/labs",
      cta: "Shop Now"
    },
    {
      text: "💊 25% Off All Practitioner-Grade Supplements via Fullscript",
      link: "/auth?type=dispensary", 
      cta: "Access Dispensary"
    },
    {
      text: "🧬 AI Lab Analysis Starting at Just $19 - No Hidden Fees",
      link: "/auth?type=analysis",
      cta: "Get Analysis"
    },
    {
      text: "⚡ Free Shipping on Orders $100+ | Same-Day Results Available",
      link: "/labs",
      cta: "Order Labs"
    }
  ];

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on('reInit', onInit);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

  // Featured Products & Panels Data
  const featuredSlides = [
    {
      id: 1,
      type: "lab-panel",
      title: "Ultimate Biohacker Panel",
      subtitle: "Complete Hormone & Performance Analysis",
      description: "Advanced biomarker testing for peak performance optimization",
      price: "$199",
      originalPrice: "$499",
      savings: "60%",
      image: "/placeholder.svg",
      features: ["Full Hormone Panel", "Cardiovascular Health", "Metabolic Function", "Inflammation Markers"],
      cta: "Order Lab Panel",
      popular: true
    },
    {
      id: 2,
      type: "supplement",
      title: "Infiniwell BPC-157",
      subtitle: "Advanced Tissue Repair & Recovery",
      description: "Premium peptide supplement for enhanced healing and gut health",
      price: "$89",
      originalPrice: "$119", 
      savings: "25%",
      image: "/placeholder.svg",
      features: ["Tissue Repair", "Gut Health", "Anti-Inflammatory", "Recovery Support"],
      cta: "Shop Now",
      popular: false
    },
    {
      id: 3,
      type: "supplement",
      title: "NAD+ Booster Complex",
      subtitle: "Cellular Energy & Longevity",
      description: "Advanced NAD+ precursors for enhanced cellular function and longevity",
      price: "$79",
      originalPrice: "$105",
      savings: "25%", 
      image: "/placeholder.svg",
      features: ["Cellular Energy", "DNA Repair", "Anti-Aging", "Cognitive Support"],
      cta: "Shop Now",
      popular: false
    },
    {
      id: 4,
      type: "lab-panel", 
      title: "Functional Medicine Complete",
      subtitle: "Comprehensive Health Assessment",
      description: "Deep dive analysis for root cause identification and optimization",
      price: "$249",
      originalPrice: "$460",
      savings: "45%",
      image: "/placeholder.svg",
      features: ["Nutrient Analysis", "Toxin Screen", "Gut Health", "Food Sensitivities"],
      cta: "Order Labs",
      popular: false
    },
    {
      id: 5,
      type: "supplement",
      title: "Longevity Stack",
      subtitle: "Comprehensive Anti-Aging Formula",
      description: "Scientifically-backed compounds for healthy aging and vitality",
      price: "$129",
      originalPrice: "$172",
      savings: "25%",
      image: "/placeholder.svg", 
      features: ["Resveratrol", "Quercetin", "Spermidine", "PQQ"],
      cta: "Shop Now",
      popular: true
    }
  ];

  const handleOrderLabs = () => {
    navigate('/labs');
  };

  const handleUploadLabs = () => {
    if (user) {
      navigate('/dashboard'); // TODO: Navigate to upload labs page  
    } else {
      navigate('/auth?type=upload-labs');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Announcement Banner */}
      <div className="bg-blue-600 text-white py-2 overflow-hidden">
        <div className="overflow-hidden" ref={topBannerRef}>
          <div className="flex">
            {announcementMessages.map((message, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0">
                <div className="text-center text-sm font-medium px-4">
                  <span className="mr-4">{message.text}</span>
                  <button 
                    onClick={() => navigate(message.link)}
                    className="text-blue-200 hover:text-white underline font-semibold ml-2 transition-colors"
                  >
                    {message.cta} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors">
            <span className="text-gray-500">Biohack</span><span className="text-blue-600">Labs</span><span className="text-gray-500">.ai</span>
          </div>
          
          {!user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-gray-600">
                  <User className="mr-2 h-4 w-4" />
                  Account
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white shadow-lg border border-gray-200 z-50">
                <DropdownMenuItem onClick={() => navigate('/auth?type=analysis')} className="cursor-pointer">
                  <Brain className="mr-2 h-4 w-4" />
                  Lab Analysis + Dispensary
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/auth?type=dispensary')} className="cursor-pointer">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Shop Dispensary (25% Off)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/auth?type=signin')} className="cursor-pointer">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-gray-600">
              <User className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative isolate overflow-hidden min-h-[70vh] pt-12 pb-16">
        {/* Backgrounds behind content */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <HeroFX variant="hero" intensity="medium" />
        </div>

        {/* Foreground content */}
        <div className="container mx-auto max-w-6xl px-4 relative z-10">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Badge className="mb-6 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                The Most Advanced Biohacking AI — Only $19
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight px-2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <span className="text-gray-900">AI Functional Analysis +</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <span className="text-blue-600">Practitioner-Direct Supplements</span>
              </motion.div>
            </motion.h1>
            
            <motion.p 
              className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Get functional medicine analysis trained on cutting-edge biohacking protocols and optimal functional ranges.
              Plus, access premium <strong>practitioner-grade supplements at 25% off retail (via Fullscript)</strong>.
            </motion.p>
            
            <motion.div 
              className="flex justify-center mb-6 px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <Button 
                size="lg" 
                onClick={handleOrderLabs}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 text-base sm:text-lg rounded-lg w-full sm:w-auto transition-all duration-200 hover:scale-105"
              >
                Get Started – Order Labs
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </motion.div>
            
            <motion.p 
              className="text-sm text-gray-500 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              Already have labs? <button onClick={handleUploadLabs} className="text-blue-600 hover:text-blue-700 underline cursor-pointer transition-colors duration-200">Upload them for $19 flat — no hidden fees</button>.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Featured Products & Lab Panels Carousel */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Biohacking Products & Lab Panels
            </h2>
            <p className="text-xl text-gray-600">
              Discover top-rated products and testing panels trusted by biohackers worldwide
            </p>
          </div>

          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {featuredSlides.map((slide) => (
                  <div key={slide.id} className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] px-3">
                    <Card className="h-full border-2 hover:border-blue-300 transition-all duration-300 hover:shadow-xl relative overflow-hidden">
                      {slide.popular && (
                        <div className="absolute top-4 left-4 z-10">
                          <Badge className="bg-red-600 text-white border-red-600">Most Popular</Badge>
                        </div>
                      )}
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-green-600 text-white border-green-600">Save {slide.savings}</Badge>
                      </div>
                      
                      <CardHeader className="text-center pt-12 pb-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          {slide.type === 'lab-panel' ? (
                            <TrendingUp className="h-10 w-10 text-blue-600" />
                          ) : (
                            <ShoppingCart className="h-10 w-10 text-purple-600" />
                          )}
                        </div>
                        <CardTitle className="text-xl text-gray-900 mb-2">{slide.title}</CardTitle>
                        <CardDescription className="text-blue-600 font-semibold">{slide.subtitle}</CardDescription>
                        <p className="text-sm text-gray-600 mt-2 px-2">{slide.description}</p>
                        
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-center gap-3 mb-2">
                            <span className="text-lg text-gray-400 line-through">{slide.originalPrice}</span>
                            <span className="text-3xl font-bold text-green-600">{slide.price}</span>
                          </div>
                          <p className="text-xs text-gray-500">25% off practitioner pricing included</p>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="px-6 pb-6">
                        <div className="space-y-2 mb-6">
                          {slide.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center text-sm text-gray-600">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                        
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => slide.type === 'lab-panel' ? handleOrderLabs() : navigate('/auth?type=dispensary')}
                        >
                          {slide.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation Arrows */}
            <button
              className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-200 hover:scale-110 z-10"
              onClick={scrollPrev}
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <button
              className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-200 hover:scale-110 z-10"
              onClick={scrollNext}
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center mt-8 space-x-2">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === selectedIndex 
                    ? 'bg-blue-600 scale-110' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => emblaApi && emblaApi.scrollTo(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              AI Functional Analysis + Practitioner-Direct Supplements
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              The lowest-cost labs, the smartest AI interpretations, and the biggest discounts on premium supplements—all in one place.
            </p>
            
            {/* Trust badges */}
            <div className="flex justify-center items-center gap-6 mb-8 text-sm text-gray-600">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-blue-600" />
                HIPAA-Compliant
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-blue-600" />
                End-to-End Encrypted
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-blue-600" />
                Secure Cloud Storage
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="px-2">
              
              <div className="space-y-6">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Order labs directly through our clinical network</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">AI analysis of results focused on functional ranges</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Personalized supplement protocols with exact dosing</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">25% off retail on 13,000+ practitioner-grade supplements</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Hands-off, HIPAA-compliant process</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">Full Lab-to-Supplement Support</div>
                
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 mb-4" 
                  size="lg"
                  onClick={handleOrderLabs}
                >
                  Get Started – Order Labs
                </Button>
                
                <div className="text-sm text-gray-500 pt-2 border-t">
                  Already have labs? <button onClick={handleUploadLabs} className="text-blue-600 hover:text-blue-700 underline cursor-pointer">Upload them for $19 flat — no hidden fees</button>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
                  <Upload className="h-8 w-8 text-blue-600" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                </div>
                <CardTitle className="text-xl">Order or Upload Labs</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Order labs directly through our clinical network or upload existing results from Quest, LabCorp, and most clinics.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
                  <Brain className="h-8 w-8 text-green-600" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                </div>
                <CardTitle className="text-xl">AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Advanced biohacking AI trained on functional medicine protocols.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
                  <ShoppingCart className="h-8 w-8 text-purple-600" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                </div>
                <CardTitle className="text-xl">Get Supplements</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Personalized protocols with direct links to premium products with practitioner-direct pricing (25% off).
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Competitor Comparison */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose BiohackLabs.ai?
            </h2>
            <p className="text-xl text-gray-600">
              The only platform offering complete lab-to-supplement optimization
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Mobile scroll hint */}
            <div className="block md:hidden bg-blue-50 px-4 py-2 text-center">
              <p className="text-sm text-blue-600 font-medium">← Swipe to compare all platforms →</p>
            </div>
            
            <div className="overflow-x-auto scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
              {/* Scroll indicators for mobile */}
              <div className="block md:hidden relative">
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
              </div>
              
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 md:p-6 font-semibold text-gray-900 sticky left-0 bg-gray-50 z-20 min-w-[160px]">Features</th>
                    <th className="text-center p-4 md:p-6 font-semibold text-gray-700 min-w-[120px]">InsideTracker</th>
                    <th className="text-center p-4 md:p-6 font-semibold text-gray-700 min-w-[120px]">Jason Health</th>
                    <th className="text-center p-4 md:p-6 font-semibold text-gray-700 min-w-[120px]">Docus AI</th>
                    <th className="text-center p-4 md:p-6 font-semibold text-gray-700 min-w-[120px]">Everlywell</th>
                    <th className="text-center p-4 md:p-6 font-semibold text-white bg-blue-600 min-w-[140px]">BiohackLabs.ai</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 md:p-6 font-medium text-gray-900 sticky left-0 bg-white z-10">Lab Ordering</td>
                    <td className="text-center p-6">
                      <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">✓</div>
                    </td>
                    <td className="text-center p-6">
                      <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">✓</div>
                    </td>
                    <td className="text-center p-6">
                      <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">✗</div>
                    </td>
                    <td className="text-center p-6">
                      <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">✓</div>
                    </td>
                    <td className="text-center p-6 bg-blue-50">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto">✓</div>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 md:p-6 font-medium text-gray-900 sticky left-0 bg-white z-10">AI Interpretation</td>
                    <td className="text-center p-4 md:p-6">
                      <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">✓</div>
                    </td>
                    <td className="text-center p-4 md:p-6">
                      <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">✗</div>
                    </td>
                    <td className="text-center p-4 md:p-6">
                      <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">✓</div>
                    </td>
                    <td className="text-center p-4 md:p-6">
                      <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">✗</div>
                    </td>
                    <td className="text-center p-4 md:p-6 bg-blue-50">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto">✓</div>
                    </td>
                  </tr>
                  
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 md:p-6 font-medium text-gray-900 sticky left-0 bg-white z-10">Biohacking AI Analysis</td>
                    <td className="text-center p-4 md:p-6">
                      <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">✗</div>
                    </td>
                    <td className="text-center p-4 md:p-6">
                      <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">✗</div>
                    </td>
                    <td className="text-center p-4 md:p-6">
                      <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">✗</div>
                    </td>
                    <td className="text-center p-4 md:p-6">
                      <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">✗</div>
                    </td>
                    <td className="text-center p-4 md:p-6 bg-blue-50">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto">✓</div>
                    </td>
                  </tr>
                  
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 md:p-6 font-medium text-gray-900 sticky left-0 bg-white z-10">Functional Range Analysis</td>
                    <td className="text-center p-4 md:p-6">
                      <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">~</div>
                    </td>
                    <td className="text-center p-4 md:p-6">
                      <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">✗</div>
                    </td>
                    <td className="text-center p-4 md:p-6">
                      <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">✗</div>
                    </td>
                    <td className="text-center p-4 md:p-6">
                      <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">✗</div>
                    </td>
                    <td className="text-center p-4 md:p-6 bg-blue-50">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto">✓</div>
                    </td>
                  </tr>
                  
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 md:p-6 font-medium text-gray-900 sticky left-0 bg-white z-10">Premium Supplement Access</td>
                    <td className="text-center p-4 md:p-6">
                      <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">~</div>
                    </td>
                    <td className="text-center p-4 md:p-6">
                      <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">✗</div>
                    </td>
                    <td className="text-center p-4 md:p-6">
                      <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">✗</div>
                    </td>
                    <td className="text-center p-4 md:p-6">
                      <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">✗</div>
                    </td>
                    <td className="text-center p-4 md:p-6 bg-blue-50">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto">✓</div>
                    </td>
                  </tr>
                  
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 md:p-6 font-medium text-gray-900 sticky left-0 bg-white z-10">Practitioner-Direct Pricing</td>
                    <td className="text-center p-4 md:p-6">
                      <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">✗</div>
                    </td>
                    <td className="text-center p-4 md:p-6">
                      <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">✗</div>
                    </td>
                    <td className="text-center p-4 md:p-6">
                      <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">✗</div>
                    </td>
                    <td className="text-center p-4 md:p-6">
                      <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">✗</div>
                    </td>
                    <td className="text-center p-4 md:p-6 bg-blue-50">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto">✓</div>
                    </td>
                  </tr>
                  
                  <tr className="bg-gray-50 font-semibold">
                    <td className="p-4 md:p-6 font-bold text-gray-900 sticky left-0 bg-gray-50 z-10">Starting Price</td>
                    <td className="text-center p-4 md:p-6 text-gray-700">$199-$599</td>
                    <td className="text-center p-4 md:p-6 text-gray-700">$39-$129</td>
                    <td className="text-center p-4 md:p-6 text-gray-700">$40-$99</td>
                    <td className="text-center p-4 md:p-6 text-gray-700">$69-$249</td>
                    <td className="text-center p-4 md:p-6 bg-blue-600 text-white font-bold">$19</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="bg-blue-600 text-white p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Only BiohackLabs.ai Offers Everything</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-6">
                <div>
                  <div className="text-3xl font-bold mb-2">500+</div>
                  <div className="text-blue-100">Lab Tests</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">$19</div>
                  <div className="text-blue-100">AI Analysis</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">25%</div>
                  <div className="text-blue-100">Supplement Savings</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">13K+</div>
                  <div className="text-blue-100">Premium Products</div>
                </div>
              </div>
              <p className="text-blue-100 text-lg">
                The complete biohacking solution: Lab ordering + AI interpretation + functional analysis + premium supplements at practitioner prices
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Testimonials
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Finally, a platform that connects my lab work to the exact supplements I need. No more guessing."
              </p>
              <div className="font-medium text-gray-900">Sarah M.</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Practitioner-direct pricing pays for itself immediately. The AI actually understands functional medicine."
              </p>
              <div className="font-medium text-gray-900">Dr. James K.</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Saved me hours of research and hundreds on supplements."
              </p>
              <div className="font-medium text-gray-900">Mike R.</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">13,000+</div>
              <div className="text-gray-600">Premium Products</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">25%</div>
              <div className="text-gray-600">Practitioner-Direct Savings</div>
              <div className="text-xs text-green-600 font-medium">Best Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">5,000+</div>
              <div className="text-gray-600">Labs Analyzed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Social Proof with CTA */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Stop guessing. Start optimizing.
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Join thousands who've transformed their health with data-driven protocols
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Finally, a platform that connects my lab work to the exact supplements I need. No more guessing."
              </p>
              <div className="font-medium text-gray-900">Sarah M.</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Practitioner-direct pricing pays for itself immediately. The AI actually understands functional medicine."
              </p>
              <div className="font-medium text-gray-900">Dr. James K.</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Saved me hours of research and hundreds on supplements."
              </p>
              <div className="font-medium text-gray-900">Mike R.</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-8 text-center mb-12">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">13,000+</div>
              <div className="text-gray-600">Premium Products</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">25%</div>
              <div className="text-gray-600">Practitioner-Direct Savings</div>
              <div className="text-xs text-green-600 font-medium">Best Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">5,000+</div>
              <div className="text-gray-600">Labs Analyzed</div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to optimize your health?
            </h3>
            <p className="text-gray-600 mb-6">
              Get AI analysis + practitioner-grade supplements at 25% off retail
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleOrderLabs}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4"
              >
                Order Labs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                onClick={handleUploadLabs}
                className="px-8 py-4"
              >
                Upload Labs - $19
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              No subscription • Fullscript dispensary access • Same-day results
            </p>
          </div>
        </div>
      </section>

      {/* Dispensary Only Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-green-50">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
            <div className="flex justify-center mb-6">
              <ShoppingCart className="h-12 w-12 text-green-600" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 text-center">
              Practitioner-Grade Supplements at 25% Off
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-6 md:mb-8 text-center px-2">
              Powered by Fullscript — 13,000+ premium products, direct from manufacturers.
            </p>
            
            <div className="bg-green-50 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
              <div className="text-sm font-medium text-green-900 mb-2 text-center">DISPENSARY ACCESS INCLUDES</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-sm text-green-800">
                <div className="flex items-center justify-start">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600 flex-shrink-0" />
                  <span>13,000+ provider-grade products</span>
                </div>
                <div className="flex items-center justify-start">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600 flex-shrink-0" />
                  <span>25% off retail prices</span>
                </div>
                <div className="flex items-center justify-start">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600 flex-shrink-0" />
                  <span>Direct from manufacturers</span>
                </div>
                <div className="flex items-center justify-start">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600 flex-shrink-0" />
                  <span>Fast shipping & returns</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth?type=dispensary')}
                className="bg-green-600 hover:bg-green-700 text-white px-8 md:px-12 py-4 md:py-6 text-base md:text-lg rounded-lg w-full sm:w-auto"
              >
                <ShoppingCart className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Access Dispensary - Free Signup
              </Button>
              
              <p className="text-sm text-gray-500 mt-4">
                No lab analysis required • Instant access • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center text-gray-600">
            <div className="text-xl font-bold text-gray-900 mb-4">
              <span className="text-gray-500">Biohack</span><span className="text-blue-600">Labs</span><span className="text-gray-500">.ai</span>
            </div>
            <p>
              Biohacking Lab Analysis, Premium Supplements, Maximum Discounts
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;