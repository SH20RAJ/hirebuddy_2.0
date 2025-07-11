import React from 'react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Heart } from 'lucide-react';

interface Volunteer {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface EnhancedVolunteerSectionProps {
  data: Volunteer[];
  onUpdate: (data: Volunteer[]) => void;
}

export const EnhancedVolunteerSection: React.FC<EnhancedVolunteerSectionProps> = ({
  data,
  onUpdate
}) => {
  const generateId = () => `vol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addVolunteer = () => {
    const newVolunteer: Volunteer = {
      id: generateId(),
      organization: '',
      role: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    onUpdate([...data, newVolunteer]);
  };

  const updateVolunteer = (id: string, field: keyof Volunteer, value: any) => {
    const updatedData = data.map(vol => 
      vol.id === id ? { ...vol, [field]: value } : vol
    );
    onUpdate(updatedData);
  };

  const removeVolunteer = (id: string) => {
    onUpdate(data.filter(vol => vol.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 bg-red-50 p-4 rounded-lg border border-red-200">
        <p className="font-medium text-red-900 mb-2">💡 Volunteer Experience Tips</p>
        <ul className="space-y-1 text-red-800">
          <li>• Include volunteer work that demonstrates relevant skills</li>
          <li>• Highlight leadership roles and impact made</li>
          <li>• Show commitment to community and causes you care about</li>
        </ul>
      </div>

      <div className="space-y-4">
        {data.map((volunteer, index) => (
          <motion.div
            key={volunteer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border border-gray-200 hover:border-red-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-600" />
                    <h3 className="font-medium">Volunteer Experience {index + 1}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVolunteer(volunteer.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Organization *</Label>
                      <Input
                        placeholder="Local Food Bank"
                        value={volunteer.organization}
                        onChange={(e) => updateVolunteer(volunteer.id, 'organization', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role *</Label>
                      <Input
                        placeholder="Volunteer Coordinator"
                        value={volunteer.role}
                        onChange={(e) => updateVolunteer(volunteer.id, 'role', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="month"
                        value={volunteer.startDate}
                        onChange={(e) => updateVolunteer(volunteer.id, 'startDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="month"
                        value={volunteer.endDate}
                        onChange={(e) => updateVolunteer(volunteer.id, 'endDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe your volunteer activities and impact..."
                      value={volunteer.description}
                      onChange={(e) => updateVolunteer(volunteer.id, 'description', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Button
        onClick={addVolunteer}
        variant="outline"
        className="w-full h-12 border-dashed border-2 border-red-300 text-red-600 hover:border-red-400"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Volunteer Experience
      </Button>
    </div>
  );
}; 