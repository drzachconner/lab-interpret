import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "lucide-react";

interface ParticipantDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNext: (data: ParticipantData) => void;
}

export interface ParticipantData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthMonth: string;
  birthDay: string;
  birthYear: string;
  gender: string;
}

export function ParticipantDetailsDialog({ open, onOpenChange, onNext }: ParticipantDetailsDialogProps) {
  const [formData, setFormData] = useState<ParticipantData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthMonth: "",
    birthDay: "",
    birthYear: "",
    gender: ""
  });

  const handleNext = () => {
    onNext(formData);
  };

  const updateField = (field: keyof ParticipantData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5" />
            Participant Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-muted-foreground">
            Provide the details of the participant in this test.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                placeholder="Zachary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                placeholder="Conner"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="zachary.riles.conner@gmail.com"
                className="bg-blue-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="619"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <div className="grid grid-cols-3 gap-4">
              <Select value={formData.birthMonth} onValueChange={(value) => updateField("birthMonth", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={month} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={formData.birthDay} onValueChange={(value) => updateField("birthDay", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                  {days.map(day => (
                    <SelectItem key={day} value={day.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={formData.birthYear} onValueChange={(value) => updateField("birthYear", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Gender at Birth</Label>
            <Select value={formData.gender} onValueChange={(value) => updateField("gender", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Gender at Birth" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center space-x-2 py-4">
            <div className="w-3 h-3 rounded-full bg-gray-900"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          </div>

          <Button 
            onClick={handleNext} 
            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
            disabled={!formData.firstName || !formData.lastName || !formData.email}
          >
            NEXT
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}