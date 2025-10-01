import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { Badge } from '@/components/ui/badge'
import { Zap, Scale, Dna, Activity, Flame, ClipboardList, AlertTriangle, Clock } from 'lucide-react'

// Symptom to lab mappings for smart search
const symptomMappings = {
  "always tired": ["thyroid", "iron", "b12"],
  "can't lose weight": ["metabolic", "thyroid", "hormone"],
  "low sex drive": ["testosterone", "hormone"],
  "brain fog": ["thyroid", "b12", "inflammation"],
  "mood swings": ["hormone", "cortisol", "thyroid"],
  "poor sleep": ["cortisol", "hormone", "thyroid"],
  "muscle weakness": ["testosterone", "vitamin", "metabolic"],
  "hair loss": ["thyroid", "hormone", "iron"],
  "digestive issues": ["inflammation", "metabolic", "nutrient"],
  "anxiety": ["cortisol", "thyroid", "b12"]
}

interface Lab {
  id: string
  name: string
  description: string
  base_price: number
  suggested_service_fee: number
  biomarkers: string[]
  turnaround_days: number
  fasting_required: boolean
  optimization_tags: string[]
  category: string
  fullscript_lab_id: string
  fee_justification: string
}

export function LabBrowsing() {
  const [labs, setLabs] = useState<Lab[]>([])
  const [cart, setCart] = useState<Lab[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  
  const categories = [
    { id: 'energy', name: 'Energy & Fatigue', icon: Zap, color: 'bg-yellow-100 text-yellow-800' },
    { id: 'hormones', name: 'Hormone Balance', icon: Scale, color: 'bg-pink-100 text-pink-800' },
    { id: 'longevity', name: 'Longevity & Aging', icon: Dna, color: 'bg-purple-100 text-purple-800' },
    { id: 'performance', name: 'Athletic Performance', icon: Activity, color: 'bg-green-100 text-green-800' },
    { id: 'weight', name: 'Weight & Metabolism', icon: Flame, color: 'bg-orange-100 text-orange-800' },
    { id: 'basics', name: 'Annual Checkup', icon: ClipboardList, color: 'bg-blue-100 text-blue-800' }
  ]
  
  useEffect(() => {
    loadLabs()
  }, [selectedCategory, searchTerm])
  
  async function loadLabs() {
    setLoading(true)
    try {
      let query = supabase
        .from('lab_panels')
        .select('*')
        .eq('is_active', true)
      
      if (selectedCategory) {
        query = query.contains('optimization_tags', [selectedCategory])
      }
      
      if (searchTerm) {
        // Check if search term matches symptoms
        const mappedTerms = Object.entries(symptomMappings)
          .filter(([symptom]) => searchTerm.toLowerCase().includes(symptom))
          .flatMap(([_, labs]) => labs)
        
        if (mappedTerms.length > 0) {
          query = query.or(mappedTerms.map(term => `name.ilike.%${term}%`).join(','))
        } else {
          query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
        }
      }
      
      const { data, error } = await query.order('base_price')
      
      if (error) {
        console.error('Error loading labs:', error)
        toast({
          title: "Error loading labs",
          description: error.message,
          variant: "destructive"
        })
      } else {
        setLabs(data || [])
      }
    } catch (error) {
      console.error('Error loading labs:', error)
      toast({
        title: "Error loading labs",
        description: "Failed to load lab panels",
        variant: "destructive"
      })
    }
    setLoading(false)
  }
  
  function addToCart(lab: Lab) {
    if (cart.some(item => item.id === lab.id)) return
    
    setCart([...cart, lab])
    toast({
      title: "Added to cart",
      description: `${lab.name} - $${lab.base_price + (lab.suggested_service_fee || 75)}`
    })
    
    // Track interaction
    if (user) {
      supabase
        .from('analytics_lab_interactions')
        .insert({ 
          user_id: user.id,
          lab_id: lab.id, 
          action: 'added_to_cart'
        })
        .then(({ error }) => {
          if (error) console.error('Analytics error:', error)
        })
    }
  }
  
  function removeFromCart(labId: string) {
    setCart(cart.filter(lab => lab.id !== labId))
    toast({
      title: "Removed from cart",
      description: "Lab panel removed from your selection"
    })
  }
  
  async function proceedToCheckout() {
    if (!zipCode) {
      toast({
        title: "ZIP code required",
        description: "Please enter your ZIP code to check lab availability",
        variant: "destructive"
      })
      return
    }
    
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to continue with checkout",
        variant: "destructive"
      })
      return
    }
    
    setCheckoutLoading(true)
    
    try {
      const { data, error } = await supabase.functions.invoke('create-fullscript-plan', {
        body: { 
          labIds: cart.map(l => l.fullscript_lab_id),
          userId: user.id,
          zipCode
        }
      })
      
      if (error) {
        throw error
      }
      
      if (data?.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank')
        setCart([]) // Clear cart after successful checkout
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      toast({
        title: "Checkout failed",
        description: error.message || "Failed to create checkout session",
        variant: "destructive"
      })
    }
    
    setCheckoutLoading(false)
  }
  
  const cartTotal = cart.reduce((sum, lab) => sum + lab.base_price + (lab.suggested_service_fee || 75), 0)
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Lab Panel Marketplace</h1>
        <p className="text-muted-foreground">
          Order comprehensive lab panels with AI-powered analysis and personalized optimization protocols
        </p>
      </div>
      
      {/* Search Bar */}
      <div className="mb-8">
        <Input
          type="text"
          placeholder="Search by symptom, goal, or test name..."
          className="w-full text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <p className="mt-2 text-sm text-muted-foreground">
          Try: "always tired", "optimize testosterone", "heart health", "brain fog"
        </p>
      </div>
      
      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
          className="h-auto p-4 flex flex-col items-center gap-2"
        >
          <ClipboardList className="h-6 w-6" />
          <span className="text-sm">All Labs</span>
        </Button>
        {categories.map(cat => {
          const Icon = cat.icon
          return (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.id)}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Icon className="h-6 w-6" />
              <span className="text-sm">{cat.name}</span>
            </Button>
          )
        })}
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading lab panels...</p>
        </div>
      )}
      
      {/* Lab Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {labs.map(lab => (
          <Card key={lab.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg">{lab.name}</h3>
              <Badge variant="secondary" className="ml-2">
                {lab.category}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {lab.description}
            </p>
            
            <div className="flex flex-wrap gap-1 mb-4">
              {lab.optimization_tags?.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="mb-4 space-y-1 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ClipboardList className="h-4 w-4" />
                <span>{lab.biomarkers?.length || 0} biomarkers</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{lab.turnaround_days} days</span>
              </div>
              {lab.fasting_required && (
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Fasting required</span>
                </div>
              )}
            </div>
            
            <div className="space-y-1 mb-4 text-sm border-t pt-4">
              <div className="flex justify-between">
                <span>Lab cost:</span>
                <span>${lab.base_price}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>AI Analysis:</span>
                <span>${lab.suggested_service_fee || 75}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${lab.base_price + (lab.suggested_service_fee || 75)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {lab.fee_justification}
              </p>
            </div>
            
            <Button 
              onClick={() => addToCart(lab)}
              className="w-full"
              disabled={cart.some(item => item.id === lab.id)}
            >
              {cart.some(item => item.id === lab.id) ? 'In Cart' : 'Add to Cart'}
            </Button>
          </Card>
        ))}
      </div>
      
      {/* Empty State */}
      {!loading && labs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No lab panels found matching your criteria.</p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('')
              setSelectedCategory(null)
            }}
            className="mt-4"
          >
            Clear filters
          </Button>
        </div>
      )}
      
      {/* Floating Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-background shadow-lg rounded-lg border p-6 max-w-sm z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Your Selection</h3>
            <Badge variant="secondary">{cart.length}</Badge>
          </div>
          
          <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
            {cart.map(lab => (
              <div key={lab.id} className="flex justify-between items-center text-sm">
                <span className="flex-1 truncate pr-2">{lab.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">${lab.base_price + (lab.suggested_service_fee || 75)}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFromCart(lab.id)}
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4 mb-4">
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>${cartTotal}</span>
            </div>
          </div>
          
          <Input
            type="text"
            placeholder="Enter ZIP code"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
            className="mb-4"
            maxLength={5}
          />
          
          <Button 
            onClick={proceedToCheckout}
            className="w-full"
            disabled={!zipCode || checkoutLoading}
          >
            {checkoutLoading ? 'Creating order...' : 'Continue to Checkout'}
          </Button>
          
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Powered by Fullscript
          </p>
        </div>
      )}
    </div>
  )
}