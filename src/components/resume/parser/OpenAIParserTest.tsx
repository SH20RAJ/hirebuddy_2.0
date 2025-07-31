import { useState } from "react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Alert, AlertDescription } from "../../ui/alert";
import { Badge } from "../../ui/badge";
import { parseResumeFromPdf } from "../../../services/openaiResumeParser";
import type { Resume } from "../../../types/resume";
import { CheckCircle, AlertTriangle, Upload, FileText, Loader2 } from "lucide-react";

export const OpenAIParserTest = () => {
  const [result, setResult] = useState<Resume | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf')) {
      setError('Please select a PDF file');
      return;
    }

    setFileName(file.name);
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const fileUrl = URL.createObjectURL(file);
      console.log('Starting OpenAI-based parsing for:', file.name);
      
      const parsedResume = await parseResumeFromPdf(fileUrl);
      console.log('Parsing completed successfully:', parsedResume);
      
      setResult(parsedResume);
      URL.revokeObjectURL(fileUrl);
    } catch (err) {
      console.error('Parsing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const getDataQuality = (resume: Resume) => {
    let score = 0;
    let total = 0;

    // Check profile completeness
    total += 6;
    if (resume.profile.name) score++;
    if (resume.profile.email) score++;
    if (resume.profile.phone) score++;
    if (resume.profile.location) score++;
    if (resume.profile.summary) score++;
    if (resume.profile.url) score++;

    // Check sections
    total += 4;
    if (resume.workExperiences.length > 0) score++;
    if (resume.educations.length > 0) score++;
    if (resume.skills.descriptions.length > 0) score++;
    if (resume.projects.length > 0) score++;

    const percentage = Math.round((score / total) * 100);
    return { score, total, percentage };
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            OpenAI Resume Parser Test
          </CardTitle>
          <p className="text-sm text-gray-600">
            Test the new AI-powered resume parsing that works with any PDF format
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                <Upload className="w-4 h-4" />
                Choose PDF File
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {fileName && (
                <Badge variant="outline" className="text-sm">
                  {fileName}
                </Badge>
              )}
            </div>
            
            {isLoading && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Parsing PDF with OpenAI...</p>
                    <p className="text-sm text-gray-600">
                      This may take 10-30 seconds depending on the resume complexity
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Parsing Successful!</span>
                      <Badge variant="secondary">
                        Quality: {getDataQuality(result).percentage}%
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Profile Information */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div><strong>Name:</strong> {result.profile.name || 'Not found'}</div>
                      <div><strong>Email:</strong> {result.profile.email || 'Not found'}</div>
                      <div><strong>Phone:</strong> {result.profile.phone || 'Not found'}</div>
                      <div><strong>Location:</strong> {result.profile.location || 'Not found'}</div>
                      <div><strong>Website:</strong> {result.profile.url || 'Not found'}</div>
                      {result.profile.summary && (
                        <div>
                          <strong>Summary:</strong>
                          <p className="text-sm text-gray-600 mt-1">{result.profile.summary}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Statistics */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Extracted Data</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Work Experiences:</span>
                        <Badge variant="outline">{result.workExperiences.length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Education:</span>
                        <Badge variant="outline">{result.educations.length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Skills:</span>
                        <Badge variant="outline">{result.skills.descriptions.length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Projects:</span>
                        <Badge variant="outline">{result.projects.length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Certifications:</span>
                        <Badge variant="outline">{result.certifications.length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Languages:</span>
                        <Badge variant="outline">{result.languages.length}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Results */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Full Parsed Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <details className="cursor-pointer">
                      <summary className="font-medium mb-2">Click to view raw JSON data</summary>
                      <pre className="text-xs bg-gray-50 p-4 rounded-md overflow-auto max-h-96 border">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </details>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 