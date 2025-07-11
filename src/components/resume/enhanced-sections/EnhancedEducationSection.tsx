import React from 'react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, GraduationCap } from 'lucide-react';

interface Education {
  id: string;
  degree: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa: string;
  honors: string;
  coursework: string[];
}

interface EnhancedEducationSectionProps {
  data: Education[];
  onUpdate: (data: Education[]) => void;
}

export const EnhancedEducationSection: React.FC<EnhancedEducationSectionProps> = ({
  data,
  onUpdate
}) => {
  const generateId = () => `edu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addEducation = () => {
    const newEducation: Education = {
      id: generateId(),
      degree: '',
      school: '',
      location: '',
      startDate: '',
      endDate: '',
      gpa: '',
      honors: '',
      coursework: []
    };
    onUpdate([...data, newEducation]);
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    const updatedData = data.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    onUpdate(updatedData);
  };

  const removeEducation = (id: string) => {
    onUpdate(data.filter(edu => edu.id !== id));
  };

  return (
    <div className="space-y-6">
      

      <div className="space-y-4">
        {data.map((education, index) => (
          <motion.div
            key={education.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border border-gray-200 hover:border-amber-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-amber-600" />
                    <h3 className="font-medium">Education {index + 1}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEducation(education.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Degree *</Label>
                    <Input
                      placeholder="Bachelor of Science in Computer Science"
                      value={education.degree}
                      onChange={(e) => updateEducation(education.id, 'degree', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>School *</Label>
                    <Input
                      placeholder="University of Technology"
                      value={education.school}
                      onChange={(e) => updateEducation(education.id, 'school', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      placeholder="Boston, MA"
                      value={education.location}
                      onChange={(e) => updateEducation(education.id, 'location', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>GPA</Label>
                    <Input
                      placeholder="3.8/4.0"
                      value={education.gpa}
                      onChange={(e) => updateEducation(education.id, 'gpa', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="month"
                      value={education.startDate}
                      onChange={(e) => updateEducation(education.id, 'startDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="month"
                      value={education.endDate}
                      onChange={(e) => updateEducation(education.id, 'endDate', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Button
        onClick={addEducation}
        variant="outline"
        className="w-full h-12 border-dashed border-2 border-amber-300 text-amber-600 hover:border-amber-400"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Education
      </Button>
    </div>
  );
}; 