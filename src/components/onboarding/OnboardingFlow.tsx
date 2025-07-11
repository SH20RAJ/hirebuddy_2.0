import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { JOB_ROLES } from '@/constants/jobRoles';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, ArrowRight, Sparkles, Target, Users, MapPin, DollarSign, Heart, Loader2, X, Plus, Zap, Coffee } from 'lucide-react';

interface OnboardingData {
  job_search_urgency: 'rush' | 'open';
  preferred_roles: string[];
  experience_level: 'student' | 'entry' | 'mid' | 'senior' | 'leadership';
  work_mode: 'remote' | 'hybrid' | 'onsite';
  salary_min: number;
  salary_max: number;
  career_goals: string[];
}

const EXPERIENCE_LEVELS = [
  { value: 'student', label: 'Student', description: 'Currently in college, looking for internship opportunities' },
  { value: 'entry', label: 'Entry-level', description: '0-2 years of experience' },
  { value: 'mid', label: 'Mid-level', description: '2-5 years of experience' },
  { value: 'senior', label: 'Senior', description: '5+ years of experience' },
];

const WORK_MODES = [
  { value: 'remote', label: 'Remote', description: 'Work from anywhere' },
  { value: 'hybrid', label: 'Hybrid', description: 'Mix of remote and office' },
  { value: 'onsite', label: 'On-site', description: 'Work from office' }
  
];

const CAREER_GOALS = [
  { value: 'company_culture', label: 'Company Culture', icon: Heart },
  { value: 'growth', label: 'Career Growth', icon: Target },
  { value: 'compensation', label: 'Compensation', icon: DollarSign },
  { value: 'location', label: 'Location', icon: MapPin }
];

const SALARY_RANGES = [
  { min: 0, max: 3, label: '₹0-3 LPA' },
  { min: 3, max: 6, label: '₹3-6 LPA' },
  { min: 6, max: 10, label: '₹6-10 LPA' },
  { min: 10, max: 15, label: '₹10-15 LPA' },
  { min: 15, max: 25, label: '₹15-25 LPA' },
  { min: 25, max: 50, label: '₹25-50 LPA' },
  { min: 50, max: 100, label: '₹50+ LPA' }
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    job_search_urgency: 'open',
    preferred_roles: [],
    experience_level: 'entry',
    work_mode: 'remote',
    salary_min: 6,
    salary_max: 10,
    career_goals: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [roleSearch, setRoleSearch] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [useCustomSalary, setUseCustomSalary] = useState(false);
  const [customSalaryRange, setCustomSalaryRange] = useState([6, 10]);
  const { user } = useAuth();
  const { toast } = useToast();

  const totalSteps = 5;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    setShowAnimation(true);

    try {
      // Update user profile with onboarding data
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...data,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Show success animation for 3 seconds
      setTimeout(() => {
        toast({
          title: "Welcome to Hirebuddy!",
          description: "Now please set your profile up.",
        });
        onComplete();
      }, 3000);

    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      setShowAnimation(false);
    }
  };

  const addCustomRole = () => {
    if (customRole.trim() && data.preferred_roles.length < 4 && !data.preferred_roles.includes(customRole.trim())) {
      setData({
        ...data,
        preferred_roles: [...data.preferred_roles, customRole.trim()]
      });
      setCustomRole('');
    }
  };

  const removeRole = (roleToRemove: string) => {
    setData({
      ...data,
      preferred_roles: data.preferred_roles.filter(role => role !== roleToRemove)
    });
  };

  const handleRoleSelect = (role: string) => {
    const isSelected = data.preferred_roles.includes(role);
    if (isSelected) {
      removeRole(role);
    } else if (data.preferred_roles.length < 4) {
      setData({
        ...data,
        preferred_roles: [...data.preferred_roles, role]
      });
    }
  };

  const filteredRoles = JOB_ROLES.filter(role => 
    role.toLowerCase().includes(roleSearch.toLowerCase()) && 
    !data.preferred_roles.includes(role)
  );

  const canProceed = () => {
    switch (currentStep) {
      case 1: return data.job_search_urgency;
      case 2: return data.preferred_roles.length > 0;
      case 3: return data.experience_level;
      case 4: return data.work_mode;
      case 5: return true; // Salary is optional
      default: return false;
    }
  };

  // Update salary data when custom slider changes
  useEffect(() => {
    if (useCustomSalary) {
      setData({
        ...data,
        salary_min: customSalaryRange[0],
        salary_max: customSalaryRange[1]
      });
    }
  }, [customSalaryRange, useCustomSalary]);

  if (showAnimation) {
    return (
      <div className="fixed inset-0 bg-[#fff7f8] flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto"
          >
            <Sparkles className="w-16 h-16 text-[#b24e55]" />
          </motion.div>
          <h2 className="text-3xl font-bold text-[#403334]">
            Great! We're matching you to jobs now...
          </h2>
          <p className="text-lg text-[#4A3D55]">
            Setting up your personalized job recommendations
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#fff7f8] flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white shadow-[0_4px_60px_rgba(231,90,130,0.35)] border-0 max-h-[90vh] overflow-y-auto">
        <CardContent className="p-4 sm:p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-[#b26469]">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-[#4A3D55]">
                {Math.round((currentStep / totalSteps) * 100)}%
              </span>
            </div>
            <div className="w-full bg-[#ffe0e0] rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-[#b24e55] to-[#E3405F] h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[300px] sm:min-h-[400px] flex flex-col"
            >
              {/* Step 1: Job Search Urgency */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#403334]">
                    What's your current urgency in finding a job 
                    </h2>
                    <p className="text-lg text-[#4A3D55]">
                    No pressure - we'll tailor your experience based on your pace
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setData({ ...data, job_search_urgency: 'rush' })}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                        data.job_search_urgency === 'rush'
                          ? 'border-[#b24e55] bg-[#ffe0e0]'
                          : 'border-gray-200 hover:border-[#b24e55] hover:bg-[#ffe0e0]'
                      }`}
                    >
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto bg-[#d35c65] rounded-full flex items-center justify-center">
                          <Zap className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-[#403334]">
                        I need a job ASAP
                        </h3>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setData({ ...data, job_search_urgency: 'open' })}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                        data.job_search_urgency === 'open'
                          ? 'border-[#b24e55] bg-[#ffe0e0]'
                          : 'border-gray-200 hover:border-[#b24e55] hover:bg-[#ffe0e0]'
                      }`}
                    >
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto bg-[#403334] rounded-full flex items-center justify-center">
                          <Coffee className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-[#403334]">
                        I'm just exploring for now
                        </h3>
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}

              {/* Step 2: Desired Roles */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#403334]">
                      Desired Role
                    </h2>
                    <p className="text-lg text-[#4A3D55]">
                      Which roles are you targeting? (Max 4 roles)
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Selected roles display */}
                    {data.preferred_roles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-[#4A3D55]">
                          Selected roles ({data.preferred_roles.length}/4):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {data.preferred_roles.map((role) => (
                            <Badge 
                              key={role} 
                              variant="secondary" 
                              className="bg-[#ffe0e0] text-[#b24e55] flex items-center gap-1 pr-1"
                            >
                              {role}
                              <button
                                onClick={() => removeRole(role)}
                                className="ml-1 hover:bg-[#b24e55] hover:text-white rounded-full p-0.5 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Custom role input */}
                    {data.preferred_roles.length < 4 && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add a custom role..."
                            value={customRole}
                            onChange={(e) => setCustomRole(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addCustomRole()}
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b24e55] focus:border-transparent"
                          />
                          <Button
                            onClick={addCustomRole}
                            disabled={!customRole.trim() || data.preferred_roles.includes(customRole.trim())}
                            className="bg-[#b24e55] hover:bg-[#a04449] text-white px-4"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Search for predefined roles */}
                    {data.preferred_roles.length < 4 && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Search predefined roles..."
                          value={roleSearch}
                          onChange={(e) => setRoleSearch(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b24e55] focus:border-transparent"
                        />

                        {roleSearch && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                            {filteredRoles.slice(0, 9).map((role) => (
                              <motion.div
                                key={role}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleRoleSelect(role)}
                                className="p-3 rounded-lg border-2 cursor-pointer transition-all text-center border-gray-200 hover:border-[#b24e55] hover:bg-[#ffe0e0]"
                              >
                                <span className="text-sm font-medium">{role}</span>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {data.preferred_roles.length >= 4 && (
                      <div className="text-center p-4 bg-[#ffe0e0] rounded-lg">
                        <p className="text-sm text-[#b24e55] font-medium">
                          Maximum of 4 roles selected. Remove a role to add another.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Experience Level */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#403334]">
                      Experience Level
                    </h2>
                    <p className="text-lg text-[#4A3D55]">
                      What's your current experience level?
                    </p>
                  </div>

                  <div className="space-y-3">
                    {EXPERIENCE_LEVELS.map((level) => (
                      <motion.div
                        key={level.value}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setData({ ...data, experience_level: level.value as any })}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          data.experience_level === level.value
                            ? 'border-[#b24e55] bg-[#ffe0e0]'
                            : 'border-gray-200 hover:border-[#b24e55] hover:bg-[#ffe0e0]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-[#403334]">{level.label}</h3>
                            <p className="text-sm text-[#4A3D55]">{level.description}</p>
                          </div>
                          {data.experience_level === level.value && (
                            <CheckCircle className="w-5 h-5 text-[#b24e55]" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Work Mode */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#403334]">
                      Work Mode
                    </h2>
                    <p className="text-lg text-[#4A3D55]">
                      How would you prefer to work?
                    </p>
                  </div>

                  <div className="space-y-3">
                    {WORK_MODES.map((mode) => (
                      <motion.div
                        key={mode.value}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setData({ ...data, work_mode: mode.value as any })}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          data.work_mode === mode.value
                            ? 'border-[#b24e55] bg-[#ffe0e0]'
                            : 'border-gray-200 hover:border-[#b24e55] hover:bg-[#ffe0e0]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-[#403334]">{mode.label}</h3>
                            <p className="text-sm text-[#4A3D55]">{mode.description}</p>
                          </div>
                          {data.work_mode === mode.value && (
                            <CheckCircle className="w-5 h-5 text-[#b24e55]" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Salary Expectations */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#403334]">
                      Salary Expectations
                    </h2>
                    <p className="text-lg text-[#4A3D55]">
                      What's your expected salary range? (Optional)
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Predefined salary ranges */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-[#403334]">Choose a range:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {SALARY_RANGES.map((range) => (
                          <motion.div
                            key={range.label}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setData({ 
                                ...data, 
                                salary_min: range.min, 
                                salary_max: range.max 
                              });
                              setUseCustomSalary(false);
                            }}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              !useCustomSalary && data.salary_min === range.min && data.salary_max === range.max
                                ? 'border-[#b24e55] bg-[#ffe0e0]'
                                : 'border-gray-200 hover:border-[#b24e55] hover:bg-[#ffe0e0]'
                            }`}
                          >
                            <div className="text-center">
                              <h3 className="text-lg font-semibold text-[#403334]">{range.label}</h3>
                              {!useCustomSalary && data.salary_min === range.min && data.salary_max === range.max && (
                                <CheckCircle className="w-5 h-5 mx-auto mt-2 text-[#b24e55]" />
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Custom salary range slider */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-[#403334]">Or set custom range:</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUseCustomSalary(!useCustomSalary)}
                          className={`border-[#b24e55] ${useCustomSalary ? 'bg-[#ffe0e0] text-[#b24e55]' : 'text-[#b24e55]'} hover:bg-[#ffe0e0]`}
                        >
                          {useCustomSalary ? 'Using Custom' : 'Use Custom'}
                        </Button>
                      </div>
                      
                      {useCustomSalary && (
                        <div className="space-y-4 p-4 border-2 border-[#b24e55] rounded-lg bg-[#ffe0e0]">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium text-[#403334]">
                              <span>Min: ₹{customSalaryRange[0]} LPA</span>
                              <span>Max: ₹{customSalaryRange[1]} LPA</span>
                            </div>
                            <Slider
                              value={customSalaryRange}
                              onValueChange={setCustomSalaryRange}
                              max={100}
                              min={0}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-[#4A3D55]">
                              <span>₹0 LPA</span>
                              <span>₹100 LPA</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-[#b24e55] font-medium">
                              Selected: ₹{customSalaryRange[0]} - ₹{customSalaryRange[1]} LPA
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-center">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setData({ ...data, salary_min: 0, salary_max: 0 });
                          setUseCustomSalary(false);
                        }}
                        className="border-[#b24e55] text-[#b24e55] hover:bg-[#ffe0e0]"
                      >
                        Skip this step
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="border-[#b24e55] text-[#b24e55] hover:bg-[#ffe0e0]"
            >
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className="bg-gradient-to-r from-[#b24e55] to-[#E3405F] hover:opacity-90 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : currentStep === totalSteps ? (
                'Complete Setup'
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 