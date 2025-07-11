import React from 'react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { User, Mail, Phone, MapPin, Globe, Github, Linkedin } from 'lucide-react';

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
}

interface EnhancedPersonalInfoSectionProps {
  data: PersonalInfo;
  onUpdate: (data: PersonalInfo) => void;
}

export const EnhancedPersonalInfoSection: React.FC<EnhancedPersonalInfoSectionProps> = ({
  data,
  onUpdate
}) => {
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onUpdate({
      ...data,
      [field]: value
    });
  };

  const inputFields = [
    {
      key: 'name' as keyof PersonalInfo,
      label: 'Full Name',
      placeholder: 'John Doe',
      icon: User,
      required: true,
      type: 'text'
    },
    {
      key: 'email' as keyof PersonalInfo,
      label: 'Email Address',
      placeholder: 'john.doe@example.com',
      icon: Mail,
      required: true,
      type: 'email'
    },
    {
      key: 'phone' as keyof PersonalInfo,
      label: 'Phone Number',
      placeholder: '+1 (555) 123-4567',
      icon: Phone,
      required: true,
      type: 'tel'
    },
    {
      key: 'location' as keyof PersonalInfo,
      label: 'Location',
      placeholder: 'New York, NY',
      icon: MapPin,
      required: false,
      type: 'text'
    },
    {
      key: 'website' as keyof PersonalInfo,
      label: 'Portfolio Website',
      placeholder: 'https://johndoe.com',
      icon: Globe,
      required: false,
      type: 'url'
    },
    {
      key: 'linkedin' as keyof PersonalInfo,
      label: 'LinkedIn',
      placeholder: 'https://linkedin.com/in/johndoe',
      icon: Linkedin,
      required: false,
      type: 'url'
    },
    {
      key: 'github' as keyof PersonalInfo,
      label: 'GitHub',
      placeholder: 'https://github.com/johndoe',
      icon: Github,
      required: false,
      type: 'url'
    }
  ];

  return (
    <div className="space-y-6">
      

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inputFields.map((field, index) => (
          <motion.div
            key={field.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={field.required ? "md:col-span-1" : "md:col-span-1"}
          >
            <Card className="h-full hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <field.icon className="w-4 h-4 text-blue-600" />
                    <Label htmlFor={field.key} className="text-sm font-medium">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                  </div>
                  
                  <Input
                    id={field.key}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={data[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full"
                    required={field.required}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Preview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Preview
            </h3>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-xl font-bold text-gray-900">
                  {data.name || 'Your Name'}
                </h4>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                {data.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{data.email}</span>
                  </div>
                )}
                {data.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{data.phone}</span>
                  </div>
                )}
                {data.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{data.location}</span>
                  </div>
                )}
              </div>

              {(data.website || data.linkedin || data.github) && (
                <div className="flex flex-wrap gap-3 text-sm">
                  {data.website && (
                    <span className="flex items-center gap-1 text-blue-600">
                      <Globe className="w-3 h-3" />
                      Portfolio
                    </span>
                  )}
                  {data.linkedin && (
                    <span className="flex items-center gap-1 text-blue-600">
                      <Linkedin className="w-3 h-3" />
                      LinkedIn
                    </span>
                  )}
                  {data.github && (
                    <span className="flex items-center gap-1 text-blue-600">
                      <Github className="w-3 h-3" />
                      GitHub
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}; 