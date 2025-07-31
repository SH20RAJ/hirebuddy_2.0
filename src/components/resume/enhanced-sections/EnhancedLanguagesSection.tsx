import React from 'react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Languages } from 'lucide-react';

interface Language {
  id: string;
  language: string;
  proficiency: string;
}

interface EnhancedLanguagesSectionProps {
  data: Language[];
  onUpdate: (data: Language[]) => void;
}

export const EnhancedLanguagesSection: React.FC<EnhancedLanguagesSectionProps> = ({
  data,
  onUpdate
}) => {
  const generateId = () => `lang_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addLanguage = () => {
    const newLanguage: Language = {
      id: generateId(),
      language: '',
      proficiency: ''
    };
    onUpdate([...data, newLanguage]);
  };

  const updateLanguage = (id: string, field: keyof Language, value: any) => {
    const updatedData = data.map(lang => 
      lang.id === id ? { ...lang, [field]: value } : lang
    );
    onUpdate(updatedData);
  };

  const removeLanguage = (id: string) => {
    onUpdate(data.filter(lang => lang.id !== id));
  };

  const proficiencyLevels = [
    'Native',
    'Fluent',
    'Advanced',
    'Intermediate',
    'Basic'
  ];

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 bg-indigo-50 p-4 rounded-lg border border-indigo-200">
        <p className="font-medium text-indigo-900 mb-2">💡 Languages Tips</p>
        <ul className="space-y-1 text-indigo-800">
          <li>• Include languages relevant to your target role</li>
          <li>• Be honest about your proficiency level</li>
          <li>• Consider including programming languages in the Skills section instead</li>
        </ul>
      </div>

      <div className="space-y-4">
        {data.map((language, index) => (
          <motion.div
            key={language.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border border-gray-200 hover:border-indigo-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-medium">Language {index + 1}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLanguage(language.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Language *</Label>
                    <Input
                      placeholder="Spanish"
                      value={language.language}
                      onChange={(e) => updateLanguage(language.id, 'language', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Proficiency Level *</Label>
                    <Select
                      value={language.proficiency}
                      onValueChange={(value) => updateLanguage(language.id, 'proficiency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select proficiency" />
                      </SelectTrigger>
                      <SelectContent>
                        {proficiencyLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Button
        onClick={addLanguage}
        variant="outline"
        className="w-full h-12 border-dashed border-2 border-indigo-300 text-indigo-600 hover:border-indigo-400"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Language
      </Button>

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Languages className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No languages added yet</p>
          <p className="text-sm">Click "Add Language" to showcase your language skills</p>
        </div>
      )}
    </div>
  );
}; 