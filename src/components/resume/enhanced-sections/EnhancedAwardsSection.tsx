import React from 'react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Award, Calendar, Building } from 'lucide-react';

interface Award {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
}

interface EnhancedAwardsSectionProps {
  data: Award[];
  onUpdate: (data: Award[]) => void;
}

export const EnhancedAwardsSection: React.FC<EnhancedAwardsSectionProps> = ({
  data,
  onUpdate
}) => {
  const generateId = () => `award_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addAward = () => {
    const newAward: Award = {
      id: generateId(),
      title: '',
      issuer: '',
      date: '',
      description: ''
    };
    onUpdate([...data, newAward]);
  };

  const updateAward = (id: string, field: keyof Award, value: string) => {
    const updatedData = data.map(award => 
      award.id === id ? { ...award, [field]: value } : award
    );
    onUpdate(updatedData);
  };

  const removeAward = (id: string) => {
    onUpdate(data.filter(award => award.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 bg-amber-50 p-4 rounded-lg border border-amber-200">
        <p className="font-medium text-amber-900 mb-2">🏆 Awards & Honors Tips</p>
        <ul className="space-y-1 text-amber-800">
          <li>• Include relevant awards that showcase your achievements</li>
          <li>• Add academic honors, professional recognitions, or industry awards</li>
          <li>• Provide context about the significance of the award</li>
          <li>• List most recent or most prestigious awards first</li>
        </ul>
      </div>

      <div className="space-y-4">
        {data.map((award, index) => (
          <motion.div
            key={award.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border border-gray-200 hover:border-amber-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span className="font-medium text-gray-900">
                      Award {index + 1}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAward(award.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`award-title-${award.id}`}>Award Title *</Label>
                    <Input
                      id={`award-title-${award.id}`}
                      value={award.title}
                      onChange={(e) => updateAward(award.id, 'title', e.target.value)}
                      placeholder="e.g., Dean's List, Employee of the Year"
                      className="border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`award-issuer-${award.id}`}>Issuing Organization</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id={`award-issuer-${award.id}`}
                        value={award.issuer}
                        onChange={(e) => updateAward(award.id, 'issuer', e.target.value)}
                        placeholder="e.g., University, Company, Organization"
                        className="pl-10 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`award-date-${award.id}`}>Date Received</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id={`award-date-${award.id}`}
                        value={award.date}
                        onChange={(e) => updateAward(award.id, 'date', e.target.value)}
                        placeholder="e.g., May 2023, 2023"
                        className="pl-10 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`award-description-${award.id}`}>Description (Optional)</Label>
                    <Textarea
                      id={`award-description-${award.id}`}
                      value={award.description}
                      onChange={(e) => updateAward(award.id, 'description', e.target.value)}
                      placeholder="Brief description of the award and its significance..."
                      rows={2}
                      className="border-gray-300 focus:border-amber-500 focus:ring-amber-500 resize-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Button
        onClick={addAward}
        variant="outline"
        className="w-full border-dashed border-2 border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Award
      </Button>

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No awards added yet</p>
          <p className="text-sm">Click "Add Award" to showcase your achievements and recognitions</p>
        </div>
      )}
    </div>
  );
};