import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Trash2, 
  X, 
  Briefcase, 
  Calendar, 
  MapPin, 
  Building,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Save
} from 'lucide-react';
import { UserExperience } from '@/services/profileService';
import { useToast } from "@/hooks/use-toast";

interface ExperienceManagerProps {
  experiences: UserExperience[];
  onUpdate: (experiences: UserExperience[]) => void;
  isEditing: boolean;
}

export const ExperienceManager: React.FC<ExperienceManagerProps> = ({
  experiences,
  onUpdate,
  isEditing
}) => {
  const { toast } = useToast();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [newSkill, setNewSkill] = useState<{[key: string]: string}>({});
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Auto-expand first item if it's empty (new experience)
  useEffect(() => {
    if (experiences.length > 0 && !experiences[0].job_title && !experiences[0].company) {
      setExpandedItems(new Set(['0']));
    }
  }, [experiences]);

  const validateExperience = (experience: UserExperience, index: number): string[] => {
    const errors: string[] = [];
    
    if (!experience.job_title?.trim()) {
      errors.push(`Experience ${index + 1}: Job title is required`);
    }
    
    if (!experience.company?.trim()) {
      errors.push(`Experience ${index + 1}: Company name is required`);
    }
    
    if (experience.start_date && experience.end_date && !experience.is_current) {
      const startDate = new Date(experience.start_date);
      const endDate = new Date(experience.end_date);
      if (startDate > endDate) {
        errors.push(`Experience ${index + 1}: Start date cannot be after end date`);
      }
    }
    
    return errors;
  };

  const addExperience = () => {
    const newExperience: UserExperience = {
      job_title: '',
      company: '',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
      achievements: [],
      skills_used: [],
      display_order: experiences.length
    };
    
    const updatedExperiences = [...experiences, newExperience];
    onUpdate(updatedExperiences);
    
    // Auto-expand the new experience
    setExpandedItems(prev => new Set([...prev, (experiences.length).toString()]));
    
    toast({
      title: "Experience Added",
      description: "New work experience added. Fill in the details below.",
    });
  };

  const updateExperience = (index: number, field: keyof UserExperience, value: any) => {
    try {
      const updatedExperiences = [...experiences];
      updatedExperiences[index] = {
        ...updatedExperiences[index],
        [field]: value
      };
      
      // Clear any existing errors for this field
      const errorKey = `${index}_${field}`;
      if (errors[errorKey]) {
        const newErrors = { ...errors };
        delete newErrors[errorKey];
        setErrors(newErrors);
      }
      
      onUpdate(updatedExperiences);
    } catch (error) {
      console.error('Error updating experience:', error);
      toast({
        title: "Error",
        description: "Failed to update experience. Please try again.",
        variant: "destructive"
      });
    }
  };

  const removeExperience = (index: number) => {
    try {
      const updatedExperiences = experiences.filter((_, i) => i !== index);
      onUpdate(updatedExperiences);
      
      // Remove from expanded items
      const key = index.toString();
      setExpandedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
      
      // Clear any errors for this experience
      const newErrors = { ...errors };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`${index}_`)) {
          delete newErrors[key];
        }
      });
      setErrors(newErrors);
      
      toast({
        title: "Experience Removed",
        description: "Work experience has been removed successfully.",
      });
    } catch (error) {
      console.error('Error removing experience:', error);
      toast({
        title: "Error",
        description: "Failed to remove experience. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleExpanded = (index: number) => {
    const key = index.toString();
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const addSkill = (expIndex: number) => {
    const skillToAdd = newSkill[expIndex.toString()]?.trim();
    if (!skillToAdd) {
      toast({
        title: "Invalid Skill",
        description: "Please enter a skill name.",
        variant: "destructive"
      });
      return;
    }

    const experience = experiences[expIndex];
    const currentSkills = experience.skills_used || [];
    
    if (currentSkills.includes(skillToAdd)) {
      toast({
        title: "Duplicate Skill",
        description: "This skill is already added.",
        variant: "destructive"
      });
      return;
    }
    
    updateExperience(expIndex, 'skills_used', [...currentSkills, skillToAdd]);
    setNewSkill(prev => ({ ...prev, [expIndex.toString()]: '' }));
  };

  const removeSkill = (expIndex: number, skillToRemove: string) => {
    const experience = experiences[expIndex];
    const currentSkills = experience.skills_used || [];
    updateExperience(expIndex, 'skills_used', currentSkills.filter(skill => skill !== skillToRemove));
  };

  const addAchievement = (expIndex: number) => {
    const experience = experiences[expIndex];
    const currentAchievements = experience.achievements || [];
    updateExperience(expIndex, 'achievements', [...currentAchievements, '']);
  };

  const updateAchievement = (expIndex: number, achievementIndex: number, value: string) => {
    const experience = experiences[expIndex];
    const currentAchievements = [...(experience.achievements || [])];
    currentAchievements[achievementIndex] = value;
    updateExperience(expIndex, 'achievements', currentAchievements);
  };

  const removeAchievement = (expIndex: number, achievementIndex: number) => {
    const experience = experiences[expIndex];
    const currentAchievements = experience.achievements || [];
    updateExperience(expIndex, 'achievements', currentAchievements.filter((_, i) => i !== achievementIndex));
  };

  const formatDateForDisplay = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      if (dateStr.includes('-') && dateStr.length === 7) {
        // Format: YYYY-MM
        const [year, month] = dateStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, expIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(expIndex);
    }
  };

  // Show empty state when no experiences and not editing
  if (experiences.length === 0 && !isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Work Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No work experience added yet</p>
            <p className="text-sm">Add your work experience to showcase your professional journey</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-600" />
          Work Experience
          {experiences.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {experiences.length} {experiences.length === 1 ? 'position' : 'positions'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {experiences.map((experience, index) => {
          const isExpanded = expandedItems.has(index.toString());
          const hasBasicInfo = experience.job_title && experience.company;
          
          return (
            <div key={`experience-${index}`} className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
              {/* Experience Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`job_title_${index}`} className="text-sm font-medium">
                          Job Title *
                        </Label>
                        <Input
                          id={`job_title_${index}`}
                          value={experience.job_title || ''}
                          onChange={(e) => updateExperience(index, 'job_title', e.target.value)}
                          placeholder="e.g. Senior Software Engineer"
                          className={!experience.job_title ? 'border-red-300' : ''}
                        />
                        {!experience.job_title && (
                          <p className="text-xs text-red-500 mt-1">Job title is required</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor={`company_${index}`} className="text-sm font-medium">
                          Company *
                        </Label>
                        <Input
                          id={`company_${index}`}
                          value={experience.company || ''}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                          placeholder="e.g. Tech Corp"
                          className={!experience.company ? 'border-red-300' : ''}
                        />
                        {!experience.company && (
                          <p className="text-xs text-red-500 mt-1">Company name is required</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {experience.job_title || 'Job Title'}
                      </h3>
                      <p className="text-blue-600 font-medium flex items-center mt-1">
                        <Building className="w-4 h-4 mr-1" />
                        {experience.company || 'Company Name'}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {!hasBasicInfo && !isEditing && (
                    <AlertCircle className="w-4 h-4 text-amber-500" aria-label="Incomplete information" />
                  )}
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(index)}
                      className="hover:bg-gray-200"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                  {isEditing && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeExperience(index)}
                      className="hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Location and Dates */}
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label htmlFor={`location_${index}`} className="text-sm font-medium">Location</Label>
                    <Input
                      id={`location_${index}`}
                      value={experience.location || ''}
                      onChange={(e) => updateExperience(index, 'location', e.target.value)}
                      placeholder="e.g. San Francisco, CA"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`start_date_${index}`} className="text-sm font-medium">Start Date</Label>
                    <Input
                      id={`start_date_${index}`}
                      type="month"
                      value={experience.start_date || ''}
                      onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Label htmlFor={`end_date_${index}`} className="text-sm font-medium">End Date</Label>
                      {experience.is_current && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Input
                        id={`end_date_${index}`}
                        type="month"
                        value={experience.end_date || ''}
                        onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                        disabled={Boolean(experience.is_current)}
                        className={experience.is_current ? 'bg-gray-100 cursor-not-allowed' : ''}
                        placeholder={experience.is_current ? 'Current position' : 'Select end date'}
                      />
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`is_current_${index}`}
                          checked={Boolean(experience.is_current)}
                          onCheckedChange={(checked) => {
                            // Update both fields in a single call to avoid race conditions
                            const updatedExperiences = [...experiences];
                            updatedExperiences[index] = {
                              ...updatedExperiences[index],
                              is_current: checked,
                              end_date: checked ? '' : updatedExperiences[index].end_date
                            };
                            onUpdate(updatedExperiences);
                            
                            // Show feedback to user
                            toast({
                              title: checked ? "Current Position Set" : "Current Position Removed",
                              description: checked ? "End date has been cleared" : "You can now set an end date",
                            });
                          }}
                        />
                        <Label htmlFor={`is_current_${index}`} className="text-sm cursor-pointer">
                          Current position
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                  {experience.location && (
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {experience.location}
                    </span>
                  )}
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDateForDisplay(experience.start_date) || 'Start date'} - {
                      experience.is_current ? (
                        <span className="text-green-600 font-medium">Present</span>
                      ) : (
                        formatDateForDisplay(experience.end_date) || 'End date'
                      )
                    }
                  </span>
                </div>
              )}

              {/* Expanded Content or Always Visible in Edit Mode */}
              {(isExpanded || isEditing) && (
                <div className="space-y-4">
                  <Separator />
                  
                  {/* Description */}
                  <div>
                    <Label htmlFor={`description_${index}`} className="text-sm font-medium">
                      Job Description
                    </Label>
                    {isEditing ? (
                      <Textarea
                        id={`description_${index}`}
                        value={experience.description || ''}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        placeholder="Describe your role, responsibilities, and key contributions..."
                        rows={3}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                        {experience.description || 'No description provided'}
                      </p>
                    )}
                  </div>

                  {/* Skills Used */}
                  <div>
                    <Label className="text-sm font-medium">Skills & Technologies</Label>
                    <div className="flex flex-wrap gap-2 mt-2 mb-2">
                      {(experience.skills_used || []).map((skill, skillIndex) => (
                        <Badge key={`skill-${skillIndex}`} variant="secondary" className="px-2 py-1">
                          {skill}
                          {isEditing && (
                            <button
                              onClick={() => removeSkill(index, skill)}
                              className="ml-2 hover:text-red-600 transition-colors"
                              title="Remove skill"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </Badge>
                      ))}
                      {(experience.skills_used || []).length === 0 && !isEditing && (
                        <span className="text-sm text-gray-500 italic">No skills specified</span>
                      )}
                    </div>
                    {isEditing && (
                      <div className="flex space-x-2">
                        <Input
                          value={newSkill[index.toString()] || ''}
                          onChange={(e) => setNewSkill(prev => ({ ...prev, [index.toString()]: e.target.value }))}
                          placeholder="Add a skill or technology..."
                          onKeyDown={(e) => handleKeyPress(e, index)}
                        />
                        <Button onClick={() => addSkill(index)} size="sm" type="button">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Achievements */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Key Achievements</Label>
                      {isEditing && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addAchievement(index)}
                          type="button"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Achievement
                        </Button>
                      )}
                    </div>
                    
                    {(experience.achievements || []).length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No achievements added yet</p>
                    ) : (
                      <div className="space-y-2">
                        {(experience.achievements || []).map((achievement, achievementIndex) => (
                          <div key={`achievement-${achievementIndex}`} className="flex items-start gap-2">
                            <div className="flex-1">
                              {isEditing ? (
                                <Textarea
                                  value={achievement}
                                  onChange={(e) => updateAchievement(index, achievementIndex, e.target.value)}
                                  placeholder="Describe a key achievement, impact, or accomplishment..."
                                  rows={2}
                                />
                              ) : (
                                <p className="text-sm text-gray-700">• {achievement}</p>
                              )}
                            </div>
                            {isEditing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAchievement(index, achievementIndex)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                title="Remove achievement"
                                type="button"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Add Experience Button */}
        {isEditing && (
          <Button
            variant="outline"
            onClick={addExperience}
            className="w-full flex items-center justify-center gap-2 border-dashed border-2 hover:border-blue-400 hover:text-blue-600"
            type="button"
          >
            <Plus className="w-4 h-4" />
            Add Work Experience
          </Button>
        )}

        {/* Summary when not editing */}
        {!isEditing && experiences.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>{experiences.length}</strong> work experience{experiences.length !== 1 ? 's' : ''} added
              {experiences.filter(exp => exp.is_current).length > 0 && (
                <span> • <strong>{experiences.filter(exp => exp.is_current).length}</strong> current position{experiences.filter(exp => exp.is_current).length !== 1 ? 's' : ''}</span>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 