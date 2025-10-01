import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ShoppingCart, 
  Info, 
  Clock, 
  Droplets, 
  Search, 
  AlertTriangle,
  Star,
  Filter,
  SortAsc,
  Grid,
  List,
  ChevronDown,
  ChevronRight,
  Activity,
  Heart,
  Zap,
  Shield
} from "lucide-react";
import { useCatalog } from "@/hooks/useCatalog";
import type { PricedPanel } from "@/types/panel";
import { EmptyState } from "@/components/ui/empty-state";

interface AdvancedLabPanelBrowserProps {
  onAddToCart: (panel: PricedPanel) => void;
  cartItems: PricedPanel[];
}

type ViewMode = 'grid' | 'list';
type SortOption = 'name' | 'price' | 'category' | 'turnaround' | 'popular';

export function AdvancedLabPanelBrowser({ onAddToCart, cartItems }: AdvancedLabPanelBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced filters
  const [fastingFilter, setFastingFilter] = useState<'all' | 'required' | 'not-required'>('all');
  const [specimenFilter, setSpecimenFilter] = useState<string>('all');
  const [turnaroundFilter, setTurnaroundFilter] = useState<number | null>(null);
  const [priceRangeFilter, setPriceRangeFilter] = useState<{ min: number | null; max: number | null }>({ min: null, max: null });
  const [popularOnly, setPopularOnly] = useState(false);
  
  const { 
    panels, 
    loading, 
    error, 
    searchPanels, 
    getPanelsByCategory, 
    getPanelsBySubcategory,
    getCategories, 
    getSubcategories,
    getPopularPanels,
    sortPanels 
  } = useCatalog();

  // Get available specimen types
  const specimenTypes = useMemo(() => {
    const specimens = new Set(panels.map(panel => panel.specimen.split('/')[0].trim()));
    return Array.from(specimens).sort();
  }, [panels]);

  // Apply all filters and sorting with optimized memoization
  const filteredAndSortedPanels = useMemo(() => {
    let filteredPanels = panels;

    // Basic search
    if (searchQuery) {
      filteredPanels = searchPanels(searchQuery);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filteredPanels = filteredPanels.filter(panel => panel.category === selectedCategory);
    }

    // Subcategory filter
    if (selectedSubcategory !== 'all') {
      filteredPanels = filteredPanels.filter(panel => panel.subcategory === selectedSubcategory);
    }

    // Popular only
    if (popularOnly) {
      filteredPanels = filteredPanels.filter(panel => panel.popular);
    }

    // Fasting filter
    if (fastingFilter !== 'all') {
      const fastingRequired = fastingFilter === 'required';
      filteredPanels = filteredPanels.filter(panel => panel.fasting_required === fastingRequired);
    }

    // Specimen filter
    if (specimenFilter !== 'all') {
      filteredPanels = filteredPanels.filter(panel => 
        panel.specimen.toLowerCase().includes(specimenFilter.toLowerCase())
      );
    }

    // Turnaround filter
    if (turnaroundFilter !== null) {
      filteredPanels = filteredPanels.filter(panel => {
        const turnaround = panel.turnaround_days;
        const matches = turnaround.match(/(\d+)/);
        if (matches) {
          const days = parseInt(matches[1]);
          return days <= turnaroundFilter;
        }
        return false;
      });
    }

    // Price range filter - handle null prices
    if (priceRangeFilter.min !== null || priceRangeFilter.max !== null) {
      filteredPanels = filteredPanels.filter(panel => {
        const price = panel.computed_price;
        // Skip panels without valid prices for price filtering
        if (typeof price !== 'number' || isNaN(price)) return false;
        if (priceRangeFilter.min !== null && price < priceRangeFilter.min) return false;
        if (priceRangeFilter.max !== null && price > priceRangeFilter.max) return false;
        return true;
      });
    }

    // Apply sorting
    return sortPanels(filteredPanels, sortBy);
  }, [
    panels,
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    popularOnly,
    fastingFilter,
    specimenFilter,
    turnaroundFilter,
    priceRangeFilter,
    sortBy,
    searchPanels,
    sortPanels
  ]);

  const categories = getCategories();
  const subcategories = getSubcategories(selectedCategory);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'hematology': 'bg-red-100 text-red-800 border-red-200',
      'chemistry': 'bg-blue-100 text-blue-800 border-blue-200',
      'cardiovascular': 'bg-pink-100 text-pink-800 border-pink-200',
      'thyroid': 'bg-purple-100 text-purple-800 border-purple-200',
      'hormones': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'diabetes': 'bg-orange-100 text-orange-800 border-orange-200',
      'vitamins & minerals': 'bg-green-100 text-green-800 border-green-200',
      'inflammation': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'autoimmune': 'bg-gray-100 text-gray-800 border-gray-200',
      'specialty': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'bundles': 'bg-violet-100 text-violet-800 border-violet-200',
      'default': 'bg-slate-100 text-slate-800 border-slate-200'
    };
    return colors[category.toLowerCase()] || colors['default'];
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, JSX.Element> = {
      'cardiovascular': <Heart className="h-3 w-3" />,
      'hormones': <Activity className="h-3 w-3" />,
      'specialty': <Zap className="h-3 w-3" />,
      'autoimmune': <Shield className="h-3 w-3" />
    };
    return icons[category.toLowerCase()];
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

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSearchQuery('');
    setFastingFilter('all');
    setSpecimenFilter('all');
    setTurnaroundFilter(null);
    setPriceRangeFilter({ min: null, max: null });
    setPopularOnly(false);
  };

  if (loading) {
    return (
      <EmptyState
        title="Loading lab tests..."
        description="Please wait while we load the catalog"
        icon={<div className="h-8 w-8 rounded-full bg-primary/20 animate-pulse" />}
      />
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Unable to load catalog"
        description={`There was a problem loading the lab tests: ${error}`}
        icon={<AlertTriangle className="h-8 w-8 text-destructive" />}
        action={{
          label: 'Try Again',
          onClick: () => window.location.reload()
        }}
      />
    );
  }

  if (filteredAndSortedPanels.length === 0 && panels.length > 0) {
    return (
      <EmptyState
        title="No lab tests match your filters"
        description="Try adjusting your search criteria or clearing some filters to see more results"
        icon={<Search className="h-8 w-8 text-muted-foreground" />}
        action={{
          label: 'Clear All Filters',
          onClick: clearAllFilters
        }}
      />
    );
  }

  if (panels.length === 0) {
    return (
      <EmptyState
        title="No lab tests available"
        description="The catalog appears to be empty. Please contact support if this persists."
        icon={<AlertTriangle className="h-8 w-8 text-muted-foreground" />}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Controls */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by test name, biomarkers, conditions, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>

        {/* Quick Actions Row */}
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={popularOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setPopularOnly(!popularOnly)}
              className="flex items-center gap-2"
            >
              <Star className="h-3 w-3" />
              Popular Tests
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-3 w-3" />
              Advanced Filters
              {showFilters ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>

            {/* Clear Filters */}
            {(selectedCategory !== 'all' || searchQuery || popularOnly || fastingFilter !== 'all' || specimenFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
              >
                Clear All
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SortAsc className="h-3 w-3 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price">Price Low-High</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="turnaround">Fastest Results</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex items-center rounded-lg border">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-3 w-3" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category */}
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subcategory */}
              {subcategories.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Subcategory</label>
                  <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subcategories</SelectItem>
                      {subcategories.map(subcategory => (
                        <SelectItem key={subcategory} value={subcategory}>
                          {subcategory}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Fasting Requirement */}
              <div>
                <label className="text-sm font-medium mb-2 block">Fasting Required</label>
                <Select value={fastingFilter} onValueChange={(value: 'all' | 'required' | 'not-required') => setFastingFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="required">Fasting Required</SelectItem>
                    <SelectItem value="not-required">No Fasting</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Specimen Type */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sample Type</label>
                <Select value={specimenFilter} onValueChange={setSpecimenFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {specimenTypes.map(specimen => (
                      <SelectItem key={specimen} value={specimen}>
                        {specimen}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">Price Range</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min $"
                  value={priceRangeFilter.min || ''}
                  onChange={(e) => setPriceRangeFilter(prev => ({ ...prev, min: e.target.value ? parseInt(e.target.value) : null }))}
                  className="w-24"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="number"
                  placeholder="Max $"
                  value={priceRangeFilter.max || ''}
                  onChange={(e) => setPriceRangeFilter(prev => ({ ...prev, max: e.target.value ? parseInt(e.target.value) : null }))}
                  className="w-24"
                />
              </div>
            </div>

            {/* Results Turnaround */}
            <div>
              <label className="text-sm font-medium mb-2 block">Results Within</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 5, 7].map(days => (
                  <Button
                    key={days}
                    variant={turnaroundFilter === days ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTurnaroundFilter(turnaroundFilter === days ? null : days)}
                  >
                    {days} day{days > 1 ? 's' : ''}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredAndSortedPanels.length} of {panels.length} lab tests
        </div>
        {filteredAndSortedPanels.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {(() => {
              const validPrices = filteredAndSortedPanels
                .map(p => p.computed_price)
                .filter((price): price is number => typeof price === 'number' && !isNaN(price));
              
              if (validPrices.length === 0) {
                return "Prices: Contact for details";
              }
              
              return `Price range: ${formatPrice(Math.min(...validPrices))} - ${formatPrice(Math.max(...validPrices))}`;
            })()}
          </div>
        )}
      </div>

      {/* Results */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedPanels.map((panel) => (
            <Card key={panel.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg leading-tight">{panel.display_name}</CardTitle>
                      {panel.popular && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getCategoryColor(panel.category)}>
                        {getCategoryIcon(panel.category)}
                        <span className="ml-1">{panel.category}</span>
                      </Badge>
                      {panel.subcategory && (
                        <Badge variant="outline" className="text-xs">
                          {panel.subcategory}
                        </Badge>
                      )}
                      {panel.is_higher_than_reference && (
                        <Badge variant="outline" className="text-amber-600 border-amber-200">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-primary">
                      {typeof panel.computed_price === 'number' && !isNaN(panel.computed_price) 
                        ? formatPrice(panel.computed_price)
                        : "Contact for Price"
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {typeof panel.computed_price === 'number' && !isNaN(panel.computed_price) 
                        ? "fees included" 
                        : "pricing available on request"
                      }
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 space-y-4">
                <p className="text-sm text-muted-foreground">
                  {panel.notes}
                </p>

                {panel.clinical_significance && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                    <p className="text-xs text-blue-800">
                      <strong>Clinical Use:</strong> {panel.clinical_significance}
                    </p>
                  </div>
                )}

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
                    <span>{panel.lab_provider || 'Quest/LabCorp'}</span>
                  </div>
                </div>

                {/* Biomarkers */}
                {panel.biomarkers && panel.biomarkers.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      <span className="text-xs font-medium">
                        Biomarkers ({panel.biomarkers.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {panel.biomarkers.slice(0, 4).map((marker, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {marker}
                        </Badge>
                      ))}
                      {panel.biomarkers.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{panel.biomarkers.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

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
                      <strong>Premium service includes:</strong> Advanced AI interpretation, personalized supplement protocol, and priority support.
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
      ) : (
        // List View
        <div className="space-y-3">
          {filteredAndSortedPanels.map((panel) => (
            <Card key={panel.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{panel.display_name}</h3>
                      {panel.popular && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                      <Badge className={getCategoryColor(panel.category)}>
                        {panel.category}
                      </Badge>
                      {panel.subcategory && (
                        <Badge variant="outline" className="text-xs">
                          {panel.subcategory}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Droplets className="h-3 w-3" />
                        {panel.specimen}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {panel.turnaround_days}
                      </div>
                      {panel.fasting_required && (
                        <Badge variant="outline" className="text-xs">
                          Fasting Required
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground max-w-2xl">
                      {panel.notes}
                    </p>

                    {panel.biomarkers && (
                      <div className="flex flex-wrap gap-1">
                        {panel.biomarkers.slice(0, 6).map((marker, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {marker}
                          </Badge>
                        ))}
                        {panel.biomarkers.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{panel.biomarkers.length - 6} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {typeof panel.computed_price === 'number' && !isNaN(panel.computed_price) 
                          ? formatPrice(panel.computed_price)
                          : "Contact for Price"
                        }
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {typeof panel.computed_price === 'number' && !isNaN(panel.computed_price) 
                          ? "fees included" 
                          : "pricing available on request"
                        }
                      </div>
                    </div>

                    <Button
                      onClick={() => onAddToCart(panel)}
                      disabled={isInCart(panel.id)}
                      size="sm"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {isInCart(panel.id) ? 'In Cart' : 'Add to Cart'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {filteredAndSortedPanels.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No lab tests found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
          <Button variant="outline" onClick={clearAllFilters}>
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}