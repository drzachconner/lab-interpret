import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  ShoppingCart, 
  Star, 
  Filter,
  ExternalLink,
  Award,
  Shield,
  Zap,
  Heart,
  Brain,
  Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import HeroBackground from "@/components/UnifiedBackground";

export default function ProductsCatalog() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  const categories = [
    { id: "all", name: "All Products", count: "13,000+" },
    { id: "foundational", name: "Foundational Health", count: "1,200+" },
    { id: "cognitive", name: "Cognitive Enhancement", count: "350+" },
    { id: "energy", name: "Energy & Mitochondria", count: "280+" },
    { id: "recovery", name: "Recovery & Sleep", count: "220+" },
    { id: "hormones", name: "Hormone Support", count: "180+" },
    { id: "detox", name: "Detox & Cleanse", count: "150+" },
    { id: "athletic", name: "Athletic Performance", count: "320+" },
  ];

  const popularProducts = [
    {
      id: 1,
      name: "Methylated B-Complex",
      brand: "Thorne",
      category: "Foundational Health",
      price: "$31.50",
      originalPrice: "$42.00",
      discount: "25%",
      rating: 4.8,
      reviews: 2847,
      image: "/api/placeholder/200/200",
      badges: ["Best Seller", "Methylated"],
      description: "High-potency B-complex with methylated forms for optimal absorption"
    },
    {
      id: 2,
      name: "Magnesium Glycinate",
      brand: "Pure Encapsulations",
      category: "Recovery & Sleep",
      price: "$22.50",
      originalPrice: "$30.00", 
      discount: "25%",
      rating: 4.9,
      reviews: 1923,
      image: "/api/placeholder/200/200",
      badges: ["Highly Bioavailable"],
      description: "Gentle, non-laxative form of magnesium for muscle relaxation and sleep"
    },
    {
      id: 3,
      name: "Lion's Mane Mushroom",
      brand: "Host Defense",
      category: "Cognitive Enhancement", 
      price: "$26.25",
      originalPrice: "$35.00",
      discount: "25%",
      rating: 4.7,
      reviews: 1456,
      image: "/api/placeholder/200/200",
      badges: ["Organic", "Nootropic"],
      description: "Supports cognitive function, focus, and neuroplasticity"
    },
    {
      id: 4,
      name: "CoQ10 Ubiquinol",
      brand: "Designs for Health",
      category: "Energy & Mitochondria",
      price: "$52.50",
      originalPrice: "$70.00",
      discount: "25%",
      rating: 4.8,
      reviews: 892,
      image: "/api/placeholder/200/200",
      badges: ["Active Form", "Mitochondrial"],
      description: "Active form of CoQ10 for cellular energy production and heart health"
    },
    {
      id: 5,
      name: "D3 + K2 Complex",
      brand: "Ortho Molecular",
      category: "Foundational Health",
      price: "$29.25",
      originalPrice: "$39.00",
      discount: "25%",
      rating: 4.9,
      reviews: 2156,
      image: "/api/placeholder/200/200",
      badges: ["Synergistic", "High Potency"],
      description: "Vitamin D3 with K2 for bone health and calcium metabolism"
    },
    {
      id: 6,
      name: "Curcumin Phytosome",
      brand: "Metagenics",
      category: "Detox & Cleanse",
      price: "$37.50",
      originalPrice: "$50.00",
      discount: "25%",
      rating: 4.6,
      reviews: 743,
      image: "/api/placeholder/200/200",
      badges: ["Enhanced Absorption"],
      description: "Highly bioavailable curcumin for anti-inflammatory support"
    },
    {
      id: 7,
      name: "Rhodiola Rosea",
      brand: "Gaia Herbs",
      category: "Athletic Performance",
      price: "$33.75",
      originalPrice: "$45.00",
      discount: "25%",
      rating: 4.7,
      reviews: 1087,
      image: "/api/placeholder/200/200",
      badges: ["Adaptogen", "Standardized"],
      description: "Premium adaptogen for stress resilience and athletic performance"
    },
    {
      id: 8,
      name: "Omega-3 EPA/DHA",
      brand: "Nordic Naturals",
      category: "Foundational Health",
      price: "$41.25",
      originalPrice: "$55.00",
      discount: "25%",
      rating: 4.8,
      reviews: 3241,
      image: "/api/placeholder/200/200",
      badges: ["Molecular Distilled", "Third-Party Tested"],
      description: "High-potency fish oil for brain, heart, and inflammatory health"
    }
  ];

  const filteredProducts = popularProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || 
                           product.category.toLowerCase().includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  const handleProductClick = (productId: number) => {
    // In a real app, this would open the Fullscript product page
    window.open('https://supplements.labpilot.com', '_blank', 'noopener,noreferrer');
  };

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
              <Button variant="outline" onClick={() => navigate('/auth?tab=signin')}>
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
        <HeroBackground variant="hero" intensity="medium" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-green-100 text-green-800 border-green-200 animate-fade-in">
            🛒 25% Off Professional Supplements
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-scale-in">
            Professional{" "}
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Supplement Catalog
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-in">
            Access 13,000+ practitioner-grade supplements at automatic 25% discount. 
            Top brands, third-party tested, shipped direct from manufacturers.
          </p>
          
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-full p-2 shadow-lg max-w-2xl w-full">
              <div className="flex items-center">
                <Search className="h-5 w-5 text-gray-400 ml-4" />
                <Input
                  placeholder="Search supplements, brands, or health goals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0 focus-visible:ring-0 text-lg"
                />
                <Button size="sm" className="mr-2 bg-blue-600 hover:bg-blue-700">
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Categories */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-8">
                {categories.slice(0, 8).map((category) => (
                  <TabsTrigger key={category.id} value={category.id} className="text-xs lg:text-sm">
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <div className="flex items-center gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </Tabs>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Award className="h-8 w-8 text-blue-600 mb-2" />
              <span className="font-medium text-gray-900">Practitioner Grade</span>
              <span className="text-sm text-gray-600">Professional quality</span>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="h-8 w-8 text-green-600 mb-2" />
              <span className="font-medium text-gray-900">Third-Party Tested</span>
              <span className="text-sm text-gray-600">Purity guaranteed</span>
            </div>
            <div className="flex flex-col items-center">
              <Zap className="h-8 w-8 text-purple-600 mb-2" />
              <span className="font-medium text-gray-900">25% Off Always</span>
              <span className="text-sm text-gray-600">Automatic discount</span>
            </div>
            <div className="flex flex-col items-center">
              <ShoppingCart className="h-8 w-8 text-amber-600 mb-2" />
              <span className="font-medium text-gray-900">Free Shipping</span>
              <span className="text-sm text-gray-600">On orders $50+</span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Popular Biohacking Supplements
            </h2>
            <span className="text-gray-600">
              Showing {filteredProducts.length} of 13,000+ products
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group cursor-pointer hover:shadow-lg transition-all hover-scale" onClick={() => handleProductClick(product.id)}>
                <CardHeader className="pb-2">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-4xl">💊</div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {product.badges.map((badge, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                  
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </CardTitle>
                  
                  <p className="text-sm text-gray-600">{product.brand}</p>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-green-600">
                          {product.price}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {product.originalPrice}
                        </span>
                      </div>
                      <span className="text-xs text-green-600 font-medium">
                        Save {product.discount}
                      </span>
                    </div>
                    
                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              onClick={() => window.open('https://supplements.labpilot.com', '_blank')}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              Browse Full Catalog (13,000+ Products)
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by Health Goal
            </h2>
            <p className="text-xl text-gray-600">
              Find targeted supplements for your specific optimization goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Brain className="h-8 w-8" />,
                title: "Cognitive Enhancement",
                description: "Nootropics, focus, and brain health",
                color: "blue",
                count: "350+ products"
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: "Energy & Vitality", 
                description: "Mitochondrial support and energy",
                color: "yellow",
                count: "280+ products"
              },
              {
                icon: <Heart className="h-8 w-8" />,
                title: "Heart Health",
                description: "Cardiovascular optimization",
                color: "red",
                count: "190+ products"
              },
              {
                icon: <Activity className="h-8 w-8" />,
                title: "Athletic Performance",
                description: "Recovery, strength, endurance",
                color: "green",
                count: "320+ products"
              }
            ].map((category, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all hover-scale cursor-pointer">
                <CardHeader>
                  <div className={`mx-auto w-16 h-16 bg-${category.color}-100 rounded-full flex items-center justify-center text-${category.color}-600 mb-4`}>
                    {category.icon}
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                  <Badge variant="outline">{category.count}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Optimize Your Health?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Get AI analysis + 25% off professional supplements automatically
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/auth')}
              className="bg-white text-green-600 hover:bg-gray-100"
            >
              Get Lab Analysis ($19)
            </Button>
            <Button 
              size="lg" 
              onClick={() => window.open('https://supplements.labpilot.com', '_blank')}
              className="bg-white text-green-600 hover:bg-gray-100 border-white"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Shop Now (25% Off)
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}