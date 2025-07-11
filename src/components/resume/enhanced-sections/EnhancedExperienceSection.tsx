import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Trash2, 
  Briefcase, 
  Calendar, 
  MapPin, 
  Building, 
  Star,
  GripVertical,
  Copy,
  Sparkles
} from 'lucide-react';

interface Experience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
}

interface EnhancedExperienceSectionProps {
  data: Experience[];
  onUpdate: (data: Experience[]) => void;
}

export const EnhancedExperienceSection: React.FC<EnhancedExperienceSectionProps> = ({
  data,
  onUpdate
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const generateId = () => `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addExperience = () => {
    const newExperience: Experience = {
      id: generateId(),
      jobTitle: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievements: []
    };
    onUpdate([...data, newExperience]);
    setExpandedItems(prev => new Set([...prev, newExperience.id]));
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    const updatedData = data.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    onUpdate(updatedData);
  };

  const removeExperience = (id: string) => {
    onUpdate(data.filter(exp => exp.id !== id));
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const addAchievement = (expId: string) => {
    const experience = data.find(exp => exp.id === expId);
    if (experience) {
      updateExperience(expId, 'achievements', [...experience.achievements, '']);
    }
  };

  const updateAchievement = (expId: string, achievementIndex: number, value: string) => {
    const experience = data.find(exp => exp.id === expId);
    if (experience) {
      const newAchievements = [...experience.achievements];
      newAchievements[achievementIndex] = value;
      updateExperience(expId, 'achievements', newAchievements);
    }
  };

  const removeAchievement = (expId: string, achievementIndex: number) => {
    const experience = data.find(exp => exp.id === expId);
    if (experience) {
      const newAchievements = experience.achievements.filter((_, index) => index !== achievementIndex);
      updateExperience(expId, 'achievements', newAchievements);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const duplicateExperience = (experience: Experience) => {
    const newExperience: Experience = {
      ...experience,
      id: generateId(),
      jobTitle: `${experience.jobTitle} (Copy)`,
    };
    onUpdate([...data, newExperience]);
  };

  const sampleAchievements = [
    "Increased team productivity by 25% through implementation of agile methodologies",
    "Led cross-functional team of 8 developers to deliver project 2 weeks ahead of schedule",
    "Reduced system downtime by 40% through proactive monitoring and optimization",
    "Mentored 5 junior developers, with 100% promotion rate within 12 months",
    "Implemented automated testing suite, reducing bugs in production by 60%",
    "Designed and developed RESTful APIs serving 1M+ requests per day",
    "Optimized database queries resulting in 50% faster page load times",
    "Collaborated with product team to define requirements for 3 major feature releases"
  ];

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Experience List */}
      <div className="space-y-4">
        <AnimatePresence>
          {data.map((experience, index) => {
            const isExpanded = expandedItems.has(experience.id);
            const hasContent = experience.jobTitle || experience.company || experience.description;
            
            return (
              <motion.div
                key={experience.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border border-gray-200 hover:border-purple-300 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <Briefcase className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {experience.jobTitle || `Experience ${index + 1}`}
                          </CardTitle>
                          {experience.company && (
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {experience.company}
                              {experience.location && (
                                <>
                                  <span className="mx-1">•</span>
                                  <MapPin className="w-3 h-3" />
                                  {experience.location}
                                </>
                              )}
                            </p>
                          )}
                          {(experience.startDate || experience.endDate) && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(experience.startDate)} - {experience.current ? 'Present' : formatDate(experience.endDate)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateExperience(experience)}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(experience.id)}
                          className="h-8 px-3"
                        >
                          {isExpanded ? 'Collapse' : 'Expand'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExperience(experience.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardContent className="pt-0">
                          <div className="space-y-4">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`jobTitle-${experience.id}`}>Job Title *</Label>
                                <Input
                                  id={`jobTitle-${experience.id}`}
                                  placeholder="Software Engineer"
                                  value={experience.jobTitle}
                                  onChange={(e) => updateExperience(experience.id, 'jobTitle', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`company-${experience.id}`}>Company *</Label>
                                <Input
                                  id={`company-${experience.id}`}
                                  placeholder="Tech Company Inc."
                                  value={experience.company}
                                  onChange={(e) => updateExperience(experience.id, 'company', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`location-${experience.id}`}>Location</Label>
                                <Input
                                  id={`location-${experience.id}`}
                                  placeholder="San Francisco, CA"
                                  value={experience.location}
                                  onChange={(e) => updateExperience(experience.id, 'location', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Switch
                                    id={`current-${experience.id}`}
                                    checked={experience.current}
                                    onCheckedChange={(checked) => updateExperience(experience.id, 'current', checked)}
                                  />
                                  <Label htmlFor={`current-${experience.id}`}>Currently working here</Label>
                                </div>
                              </div>
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`startDate-${experience.id}`}>Start Date</Label>
                                <Input
                                  id={`startDate-${experience.id}`}
                                  type="month"
                                  value={experience.startDate}
                                  onChange={(e) => updateExperience(experience.id, 'startDate', e.target.value)}
                                />
                              </div>
                              {!experience.current && (
                                <div className="space-y-2">
                                  <Label htmlFor={`endDate-${experience.id}`}>End Date</Label>
                                  <Input
                                    id={`endDate-${experience.id}`}
                                    type="month"
                                    value={experience.endDate}
                                    onChange={(e) => updateExperience(experience.id, 'endDate', e.target.value)}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                              <Label htmlFor={`description-${experience.id}`}>Job Description</Label>
                              <Textarea
                                id={`description-${experience.id}`}
                                placeholder="Provide a brief overview of your role and responsibilities..."
                                value={experience.description}
                                onChange={(e) => updateExperience(experience.id, 'description', e.target.value)}
                                rows={3}
                              />
                            </div>

                            <Separator />

                            {/* Achievements */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2">
                                  <Star className="w-4 h-4 text-yellow-500" />
                                  Key Achievements
                                </Label>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addAchievement(experience.id)}
                                  className="h-8"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Achievement
                                </Button>
                              </div>

                              {experience.achievements.length === 0 && (
                                <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                                  <Star className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                  <p className="text-sm">No achievements added yet</p>
                                  <p className="text-xs">Click "Add Achievement" to get started</p>
                                </div>
                              )}

                              <AnimatePresence>
                                {experience.achievements.map((achievement, achievementIndex) => (
                                  <motion.div
                                    key={achievementIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex gap-2"
                                  >
                                    <div className="flex-1">
                                      <Textarea
                                        placeholder="Describe a specific achievement with quantifiable results..."
                                        value={achievement}
                                        onChange={(e) => updateAchievement(experience.id, achievementIndex, e.target.value)}
                                        rows={2}
                                        className="resize-none"
                                      />
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeAchievement(experience.id, achievementIndex)}
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 mt-1"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </motion.div>
                                ))}
                              </AnimatePresence>

                              {/* Sample Achievements */}
                              {experience.achievements.length < 3 && (
                                <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
                                  <CardContent className="p-3">
                                    <h4 className="text-sm font-medium text-yellow-900 mb-2 flex items-center gap-1">
                                      <Sparkles className="w-3 h-3" />
                                      Sample Achievements
                                    </h4>
                                    <div className="space-y-2">
                                      {sampleAchievements.slice(0, 3).map((sample, index) => (
                                        <div key={index} className="flex items-start justify-between text-xs">
                                          <p className="text-yellow-800 flex-1 pr-2">{sample}</p>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              const newAchievements = [...experience.achievements, sample];
                                              updateExperience(experience.id, 'achievements', newAchievements);
                                            }}
                                            className="h-6 px-2 text-xs"
                                          >
                                            Use
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add Experience Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={addExperience}
          variant="outline"
          className="w-full h-12 border-dashed border-2 border-purple-300 text-purple-600 hover:border-purple-400 hover:text-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Work Experience
        </Button>
      </motion.div>

      {/* Summary */}
      {data.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200">
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-600" />
                Experience Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-600">{data.length}</div>
                  <div className="text-gray-600">Positions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-600">
                    {data.reduce((total, exp) => total + exp.achievements.length, 0)}
                  </div>
                  <div className="text-gray-600">Achievements</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-600">
                    {data.filter(exp => exp.current).length}
                  </div>
                  <div className="text-gray-600">Current</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-600">
                    {data.filter(exp => exp.jobTitle && exp.company).length}
                  </div>
                  <div className="text-gray-600">Complete</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};