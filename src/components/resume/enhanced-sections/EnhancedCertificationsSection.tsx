import React from 'react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Award, Calendar, Building, ExternalLink, Hash } from 'lucide-react';

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate: string;
  credentialId: string;
  link: string;
}

interface EnhancedCertificationsSectionProps {
  data: Certification[];
  onUpdate: (data: Certification[]) => void;
}

export const EnhancedCertificationsSection: React.FC<EnhancedCertificationsSectionProps> = ({
  data,
  onUpdate
}) => {
  const generateId = () => `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addCertification = () => {
    const newCertification: Certification = {
      id: generateId(),
      name: '',
      issuer: '',
      date: '',
      expiryDate: '',
      credentialId: '',
      link: ''
    };
    onUpdate([...data, newCertification]);
  };

  const updateCertification = (id: string, field: keyof Certification, value: any) => {
    const updatedData = data.map(cert => 
      cert.id === id ? { ...cert, [field]: value } : cert
    );
    onUpdate(updatedData);
  };

  const removeCertification = (id: string) => {
    onUpdate(data.filter(cert => cert.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 bg-orange-50 p-4 rounded-lg border border-orange-200">
        <p className="font-medium text-orange-900 mb-2">🏆 Certifications Tips</p>
        <ul className="space-y-1 text-orange-800">
          <li>• Include relevant professional certifications</li>
          <li>• Add credential IDs and verification links when available</li>
          <li>• List most recent or relevant certifications first</li>
          <li>• Include expiry dates to show current validity</li>
        </ul>
      </div>

      <div className="space-y-4">
        {data.map((certification, index) => (
          <motion.div
            key={certification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border border-gray-200 hover:border-orange-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-orange-600" />
                    <h3 className="font-medium">Certification {index + 1}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCertification(certification.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Certification Name *</Label>
                      <Input
                        placeholder="AWS Certified Solutions Architect"
                        value={certification.name}
                        onChange={(e) => updateCertification(certification.id, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Issuing Organization *</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Amazon Web Services"
                          value={certification.issuer}
                          onChange={(e) => updateCertification(certification.id, 'issuer', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Issue Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="month"
                          value={certification.date}
                          onChange={(e) => updateCertification(certification.id, 'date', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Expiry Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="month"
                          value={certification.expiryDate}
                          onChange={(e) => updateCertification(certification.id, 'expiryDate', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Credential ID</Label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="ABC123456789"
                          value={certification.credentialId}
                          onChange={(e) => updateCertification(certification.id, 'credentialId', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Verification Link</Label>
                      <div className="relative">
                        <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="https://verify.example.com"
                          value={certification.link}
                          onChange={(e) => updateCertification(certification.id, 'link', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Button
        onClick={addCertification}
        variant="outline"
        className="w-full h-12 border-dashed border-2 border-orange-300 text-orange-600 hover:border-orange-400"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Certification
      </Button>

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No certifications added yet</p>
          <p className="text-sm">Click "Add Certification" to showcase your professional credentials</p>
        </div>
      )}
    </div>
  );
}; 