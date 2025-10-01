import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useFullscript } from '@/hooks/useFullscript'

export function LabCatalog() {
  const [labs, setLabs] = useState<any[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [zipCode, setZipCode] = useState('')
  const [loading, setLoading] = useState(true)
  const { createLabPlan } = useFullscript()
  const { toast } = useToast()
  
  useEffect(() => {
    loadLabs()
  }, [])
  
  async function loadLabs() {
    const { data, error } = await supabase
      .from('lab_panels')
      .select('*')
      .eq('is_active', true)
      .order('base_price')
    
    if (data) setLabs(data)
    setLoading(false)
  }
  
  async function checkout() {
    if (!zipCode || zipCode.length !== 5) {
      toast({
        title: "ZIP code required",
        description: "Please enter a valid 5-digit ZIP code",
        variant: "destructive"
      })
      return
    }
    
    try {
      const labIds = cart.map(lab => lab.fullscript_lab_id).filter(Boolean)
      
      if (labIds.length === 0) {
        toast({
          title: "No Fullscript labs",
          description: "Please sync with Fullscript first",
          variant: "destructive"
        })
        return
      }
      
      const result = await createLabPlan(labIds, zipCode)
      
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      }
    } catch (error) {
      console.error('Checkout error:', error)
    }
  }
  
  const cartTotal = cart.reduce((sum, lab) => 
    sum + lab.base_price + (lab.suggested_service_fee || 75), 0
  )
  
  if (loading) return <div>Loading labs...</div>
  
  return (
    <div className="container mx-auto p-6">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Lab Grid */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold">Available Lab Tests</h2>
          
          {labs.map(lab => (
            <Card key={lab.id}>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>{lab.name}</span>
                  <Badge>{lab.category}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{lab.description}</p>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm">Lab: ${lab.base_price}</p>
                    <p className="text-sm text-green-600">
                      AI Analysis: ${lab.suggested_service_fee || 75}
                    </p>
                    <p className="font-bold">
                      Total: ${lab.base_price + (lab.suggested_service_fee || 75)}
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => setCart([...cart, lab])}
                    disabled={cart.some(item => item.id === lab.id)}
                  >
                    {cart.some(item => item.id === lab.id) ? 'Added' : 'Add to Cart'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Cart Sidebar */}
        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Your Cart ({cart.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-muted-foreground">No labs selected</p>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {cart.map(lab => (
                      <div key={lab.id} className="text-sm">
                        <p>{lab.name}</p>
                        <p className="text-muted-foreground">
                          ${lab.base_price + (lab.suggested_service_fee || 75)}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <p className="font-bold text-lg">Total: ${cartTotal}</p>
                  </div>
                  
                  <div className="mt-4 space-y-4">
                    <Input
                      placeholder="ZIP Code"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      maxLength={5}
                    />
                    
                    <Button 
                      onClick={checkout} 
                      className="w-full"
                      disabled={!zipCode || cart.length === 0}
                    >
                      Continue to Fullscript
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}