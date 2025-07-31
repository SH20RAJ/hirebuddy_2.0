import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles, RotateCcw, Copy, Check } from 'lucide-react';

interface EnhancedSummarySectionProps {
  data: string;
  onUpdate: (data: string) => void;
}

export const EnhancedSummarySection: React.FC<EnhancedSummarySectionProps> = ({
  data,
  onUpdate
}) => {
  const [copied, setCopied] = useState(false);

  const handleChange = (value: string) => {
    onUpdate(value);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getCharacterCount = () => data.length;
  const getWordCount = () => data.trim().split(/\s+/).filter(word => word.length > 0).length;

  const getScoreColor = (count: number, min: number, max: number) => {
    if (count < min) return 'text-red-600';
    if (count > max) return 'text-amber-600';
    return 'text-green-600';
  };

  const sampleSummaries = [
    {
      title: "Software Engineer",
      content: "Experienced software engineer with 5+ years developing scalable web applications using React, Node.js, and cloud technologies. Proven track record of leading cross-functional teams and delivering high-quality solutions that improve user experience and business outcomes. Passionate about clean code, performance optimization, and mentoring junior developers."
    },
    {
      title: "Marketing Professional",
      content: "Results-driven marketing professional with 7+ years of experience in digital marketing, brand management, and campaign optimization. Expertise in data-driven strategies that increased lead generation by 150% and improved customer engagement across multiple channels. Strong analytical skills with proficiency in Google Analytics, HubSpot, and marketing automation tools."
    },
    {
      title: "Project Manager",
      content: "Certified PMP with 8+ years managing complex projects from initiation to delivery. Successfully led teams of 15+ members across multiple time zones, consistently delivering projects on time and under budget. Expert in Agile methodologies, risk management, and stakeholder communication with a track record of improving team productivity by 40%."
    },
    {
      title: "Data Scientist",
      content: "Data scientist with 4+ years of experience in machine learning, statistical analysis, and predictive modeling. Proficient in Python, R, SQL, and cloud platforms (AWS, GCP). Developed ML models that improved business decision-making and generated $2M+ in cost savings. Strong background in data visualization and communicating insights to non-technical stakeholders."
    }
  ];

  const tips = [
    "Keep it concise: 2-4 sentences or 100-200 words",
    "Start with your years of experience and key expertise",
    "Include quantifiable achievements when possible",
    "Mention relevant skills and technologies",
    "Tailor it to the specific role you're applying for",
    "Use action words and avoid generic phrases"
  ];

  return (
    <div className="space-y-6">
      {/* Tips Section */}
      <div className="text-sm text-gray-600 bg-green-50 p-4 rounded-lg border border-green-200">
        <p className="font-medium text-green-900 mb-2">💡 Professional Summary Tips</p>
        <ul className="space-y-1 text-green-800">
          {tips.map((tip, index) => (
            <li key={index}>• {tip}</li>
          ))}
        </ul>
      </div>

      {/* Main Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border border-gray-200 hover:border-green-300 transition-colors">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label 
                  htmlFor="summary"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-green-600" />
                  Professional Summary
                  <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getScoreColor(getCharacterCount(), 100, 400)}>
                    {getCharacterCount()} chars
                  </Badge>
                  <Badge variant="outline" className={getScoreColor(getWordCount(), 20, 80)}>
                    {getWordCount()} words
                  </Badge>
                </div>
              </div>
              
              <Textarea
                id="summary"
                placeholder="Write a compelling professional summary that highlights your key qualifications, experience, and value proposition. Focus on your most relevant achievements and skills that align with your target role..."
                value={data}
                onChange={(e) => handleChange(e.target.value)}
                className="min-h-[120px] border-gray-300 focus:border-green-500 focus:ring-green-500 resize-none"
                rows={6}
              />
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span className={getScoreColor(getCharacterCount(), 100, 400)}>
                    Optimal: 100-400 characters
                  </span>
                  <span className={getScoreColor(getWordCount(), 20, 80)}>
                    Optimal: 20-80 words
                  </span>
                </div>
                {data && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(data)}
                    className="h-6 px-2"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sample Summaries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Sample Professional Summaries
            </h3>
            <div className="space-y-3">
              {sampleSummaries.map((sample, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-3 bg-white rounded-lg border border-purple-100 hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-purple-900">{sample.title}</h4>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleChange(sample.content)}
                        className="h-6 px-2 text-xs"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Use
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(sample.content)}
                        className="h-6 px-2 text-xs"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{sample.content}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {sample.content.length} chars
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {sample.content.trim().split(/\s+/).length} words
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Preview */}
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-600" />
                Preview
              </h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">{data}</p>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-green-200">
                <Badge 
                  variant={getCharacterCount() >= 100 && getCharacterCount() <= 400 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {getCharacterCount() >= 100 && getCharacterCount() <= 400 ? "✓" : "!"} Length
                </Badge>
                <Badge 
                  variant={getWordCount() >= 20 && getWordCount() <= 80 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {getWordCount() >= 20 && getWordCount() <= 80 ? "✓" : "!"} Word Count
                </Badge>
                <Badge 
                  variant={data.includes("years") || data.includes("experience") ? "default" : "secondary"}
                  className="text-xs"
                >
                  {data.includes("years") || data.includes("experience") ? "✓" : "!"} Experience Mentioned
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}; 