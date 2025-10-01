import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Package } from "lucide-react";
import { ShoppingCart } from "lucide-react";

interface ReceivingAddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  onAddToCart: (data: AddressData) => void;
}

export interface AddressData {
  address: string;
  city: string;
  zipCode: string;
  state: string;
  country: string;
  firstNameInitial: string;
  lastName: string;
  consentAgreed: boolean;
}

export function ReceivingAddressDialog({ open, onOpenChange, onBack, onAddToCart }: ReceivingAddressDialogProps) {
  const [formData, setFormData] = useState<AddressData>({
    address: "",
    city: "",
    zipCode: "",
    state: "",
    country: "",
    firstNameInitial: "",
    lastName: "",
    consentAgreed: false
  });

  const handleAddToCart = () => {
    onAddToCart(formData);
  };

  const updateField = (field: keyof AddressData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const states = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
    "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
    "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", 
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", 
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", 
    "Wisconsin", "Wyoming"
  ];

  const countries = ["United States", "Canada"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="h-5 w-5" />
            Receiving Address
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-muted-foreground">
            Provide the receiving address for the participant.
          </p>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="Enter Your Address (Please note we do not ship to P.O. Boxes)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => updateField("city", e.target.value)}
              placeholder="-"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => updateField("zipCode", e.target.value)}
                placeholder="-"
              />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Select value={formData.state} onValueChange={(value) => updateField("state", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent>
                  {states.map(state => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={formData.country} onValueChange={(value) => updateField("country", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium">Please provide consent details</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstNameInitial">First Name Initial</Label>
                <Input
                  id="firstNameInitial"
                  value={formData.firstNameInitial}
                  onChange={(e) => updateField("firstNameInitial", e.target.value)}
                  placeholder="First Name Initial"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastNameConsent">Last Name</Label>
                <Input
                  id="lastNameConsent"
                  value={formData.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  placeholder="Last Name"
                />
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="consent"
                checked={formData.consentAgreed}
                onCheckedChange={(checked) => updateField("consentAgreed", checked as boolean)}
              />
              <Label htmlFor="consent" className="text-sm leading-relaxed">
                I certify that I have read and agree to the{" "}
                <a href="#" className="text-blue-500 underline">
                  10X Informed Consent
                </a>
              </Label>
            </div>
          </div>

          <div className="flex justify-center space-x-2 py-4">
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <div className="w-3 h-3 rounded-full bg-gray-900"></div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleAddToCart} 
              className="w-full bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center gap-2"
              disabled={!formData.address || !formData.city || !formData.zipCode || !formData.state || !formData.country || !formData.consentAgreed}
            >
              <ShoppingCart className="h-4 w-4" />
              ADD TO CART
            </Button>

            <Button 
              variant="ghost" 
              onClick={onBack}
              className="w-full text-gray-600 hover:text-gray-800"
            >
              Go back a step
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}