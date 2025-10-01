import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Info, Clock, Droplets, Search, AlertTriangle } from "lucide-react";
import { useCatalog } from "@/hooks/useCatalog";
import type { PricedPanel } from "@/types/panel";

interface LabPanelBrowserProps {
  onAddToCart: (panel: PricedPanel) => void;
  cartItems: PricedPanel[];
}

export function LabPanelBrowser({ onAddToCart, cartItems }: LabPanelBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { panels, loading, error, searchPanels, getPanelsByCategory, getCategories } = useCatalog();

  // Filter panels based on search and category
  let filteredPanels = panels;
  
  if (selectedCategory !== 'all') {
    filteredPanels = getPanelsByCategory(selectedCategory);
  }
  
  if (searchQuery) {
    filteredPanels = searchPanels(searchQuery).filter(panel => 
      selectedCategory === 'all' || panel.category === selectedCategory
    );
  }

  const categories = getCategories();

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'blood': return 'bg-red-100 text-red-800 border-red-200';
      case 'bundle': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const isInCart = (panelId: string) => {
    return cartItems.some(item => item.id === panelId);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search lab panels, biomarkers, or conditions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category)}
            size="sm"
          >
            {category === 'all' ? 'All Panels' : category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      {/* Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPanels.map((panel) => (
          <Card key={panel.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{panel.display_name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(panel.category)}>
                      {panel.category}
                    </Badge>
                    {panel.is_higher_than_reference && (
                      <Badge variant="outline" className="text-amber-600 border-amber-200">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(panel.computed_price)}
                  </div>
                  <div className="text-xs text-muted-foreground">fees included</div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 space-y-4">
              <p className="text-sm text-muted-foreground">
                {panel.notes}
              </p>

              {/* Test Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Droplets className="h-3 w-3" />
                  <span>{panel.specimen}</span>
                  {panel.fasting_required && (
                    <>
                      <Separator orientation="vertical" className="h-3" />
                      <span>Fasting required</span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{panel.turnaround_days} results</span>
                  <Separator orientation="vertical" className="h-3" />
                  <span>FS SKU: {panel.fs_sku}</span>
                </div>
              </div>

              {/* Aliases/Keywords */}
              {panel.aliases.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    <span className="text-xs font-medium">
                      Also known as
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {panel.aliases.slice(0, 3).map((alias, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {alias}
                      </Badge>
                    ))}
                    {panel.aliases.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{panel.aliases.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Pricing Notice for Premium Items */}
              {panel.is_higher_than_reference && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800">
                    <strong>Best-in-class AI interpretation + supplement protocol included.</strong><br/>
                    Some specialty tests may have premium pricing due to network authorization and processing requirements.
                  </p>
                </div>
              )}

              <Button
                onClick={() => onAddToCart(panel)}
                disabled={isInCart(panel.id)}
                className="w-full"
                size="sm"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {isInCart(panel.id) ? 'Added to Cart' : 'Add to Cart'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPanels.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No lab panels found in this category.
          </p>
        </div>
      )}
    </div>
  );
}