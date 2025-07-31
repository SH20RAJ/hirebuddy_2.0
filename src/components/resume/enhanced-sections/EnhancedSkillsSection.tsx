import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Plus, X, Sparkles } from 'lucide-react';

interface Skills {
  technical: string[];
  soft: string[];
  languages: string[];
  frameworks: string[];
}

interface EnhancedSkillsSectionProps {
  data: Skills;
  onUpdate: (data: Skills) => void;
}

export const EnhancedSkillsSection: React.FC<EnhancedSkillsSectionProps> = ({
  data,
  onUpdate
}) => {
  const [newSkills, setNewSkills] = useState({
    technical: '',
    soft: '',
    languages: '',
    frameworks: ''
  });

  const addSkill = (category: keyof Skills, skill: string) => {
    if (skill.trim() && !data[category].includes(skill.trim())) {
      onUpdate({
        ...data,
        [category]: [...data[category], skill.trim()]
      });
      setNewSkills(prev => ({ ...prev, [category]: '' }));
    }
  };

  const removeSkill = (category: keyof Skills, skillToRemove: string) => {
    onUpdate({
      ...data,
      [category]: data[category].filter(skill => skill !== skillToRemove)
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent, category: keyof Skills) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(category, newSkills[category]);
    }
  };

  const sampleSkills = {
    technical: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git', 'AWS', 'Docker'],
    soft: ['Leadership', 'Communication', 'Problem Solving', 'Team Collaboration', 'Time Management'],
    languages: ['Java', 'Python', 'C#', 'C++', 'C', 'Ruby', 'Go', 'JavaScript', 'TypeScript', 'Swift'],
    frameworks: ['React', 'Vue.js', 'Angular', 'Express.js', 'Django', 'Spring Boot', 'Laravel']
  };

  const skillCategories = [
    { key: 'technical' as keyof Skills, label: 'Technical Skills', color: 'blue', icon: Code },
    { key: 'frameworks' as keyof Skills, label: 'Frameworks & Libraries', color: 'purple', icon: Code },
    { key: 'soft' as keyof Skills, label: 'Soft Skills', color: 'green', icon: Code },
    { key: 'languages' as keyof Skills, label: 'Programming Languages', color: 'orange', icon: Code }
  ];

  return (
    <div className="space-y-6">
      

      <div className="space-y-6">
        {skillCategories.map((category, categoryIndex) => (
          <motion.div
            key={category.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
          >
            <Card className="border border-gray-200 hover:border-cyan-300 transition-colors">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <category.icon className="w-4 h-4 text-cyan-600" />
                    <Label className="font-medium">{category.label}</Label>
                  </div>

                  {/* Add new skill */}
                  <div className="flex gap-2">
                    <Input
                      placeholder={`Add ${category.label.toLowerCase()}...`}
                      value={newSkills[category.key]}
                      onChange={(e) => setNewSkills(prev => ({ ...prev, [category.key]: e.target.value }))}
                      onKeyPress={(e) => handleKeyPress(e, category.key)}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => addSkill(category.key, newSkills[category.key])}
                      size="sm"
                      disabled={!newSkills[category.key].trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Current skills */}
                  {data[category.key].length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {data[category.key].map((skill, index) => (
                        <motion.div
                          key={skill}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1 pr-1 hover:bg-gray-200 transition-colors"
                          >
                            {skill}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSkill(category.key, skill)}
                              className="h-4 w-4 p-0 hover:bg-red-100 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Sample skills */}
                  {data[category.key].length < 5 && (
                    <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200">
                      <CardContent className="p-3">
                        <h4 className="text-sm font-medium text-cyan-900 mb-2 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Suggested {category.label}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {sampleSkills[category.key]
                            .filter(skill => !data[category.key].includes(skill))
                            .slice(0, 6)
                            .map((skill) => (
                              <Button
                                key={skill}
                                variant="ghost"
                                size="sm"
                                onClick={() => addSkill(category.key, skill)}
                                className="h-6 px-2 text-xs border border-cyan-200 hover:border-cyan-300"
                              >
                                + {skill}
                              </Button>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      {Object.values(data).some(arr => arr.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200">
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-600" />
                Skills Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {skillCategories.map((category) => (
                  <div key={category.key} className="text-center">
                    <div className="text-lg font-semibold text-cyan-600">
                      {data[category.key].length}
                    </div>
                    <div className="text-gray-600 text-xs">{category.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-cyan-200">
                <p className="text-sm text-gray-600">
                  Total Skills: <span className="font-semibold text-cyan-600">
                    {Object.values(data).flat().length}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};