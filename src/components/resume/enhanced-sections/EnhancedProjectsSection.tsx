import React from 'react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Globe, Github, ExternalLink, Calendar } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link: string;
  github: string;
  startDate: string;
  endDate: string;
}

interface EnhancedProjectsSectionProps {
  data: Project[];
  onUpdate: (data: Project[]) => void;
}

export const EnhancedProjectsSection: React.FC<EnhancedProjectsSectionProps> = ({
  data,
  onUpdate
}) => {
  const generateId = () => `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addProject = () => {
    const newProject: Project = {
      id: generateId(),
      name: '',
      description: '',
      technologies: [],
      link: '',
      github: '',
      startDate: '',
      endDate: ''
    };
    onUpdate([...data, newProject]);
  };

  const updateProject = (id: string, field: keyof Project, value: any) => {
    const updatedData = data.map(proj => 
      proj.id === id ? { ...proj, [field]: value } : proj
    );
    onUpdate(updatedData);
  };

  const removeProject = (id: string) => {
    onUpdate(data.filter(proj => proj.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 bg-pink-50 p-4 rounded-lg border border-pink-200">
        <p className="font-medium text-pink-900 mb-2">🚀 Projects Tips</p>
        <ul className="space-y-1 text-pink-800">
          <li>• Showcase projects that demonstrate relevant skills</li>
          <li>• Include both personal and professional projects</li>
          <li>• Add live links and GitHub repositories when available</li>
          <li>• Highlight the technologies and tools you used</li>
        </ul>
      </div>

      <div className="space-y-4">
        {data.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border border-gray-200 hover:border-pink-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-pink-600" />
                    <h3 className="font-medium">Project {index + 1}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProject(project.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Project Name *</Label>
                      <Input
                        placeholder="E-commerce Website"
                        value={project.name}
                        onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Technologies (comma-separated)</Label>
                      <Input
                        placeholder="React, Node.js, MongoDB"
                        value={project.technologies.join(', ')}
                        onChange={(e) => updateProject(project.id, 'technologies', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe your project, its purpose, and key features..."
                      value={project.description}
                      onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Live Link</Label>
                      <div className="relative">
                        <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="https://myproject.com"
                          value={project.link}
                          onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>GitHub Repository</Label>
                      <div className="relative">
                        <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="https://github.com/username/project"
                          value={project.github}
                          onChange={(e) => updateProject(project.id, 'github', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="month"
                          value={project.startDate}
                          onChange={(e) => updateProject(project.id, 'startDate', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="month"
                          value={project.endDate}
                          onChange={(e) => updateProject(project.id, 'endDate', e.target.value)}
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
        onClick={addProject}
        variant="outline"
        className="w-full h-12 border-dashed border-2 border-pink-300 text-pink-600 hover:border-pink-400"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Project
      </Button>

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No projects added yet</p>
          <p className="text-sm">Click "Add Project" to showcase your work and achievements</p>
        </div>
      )}
    </div>
  );
}; 