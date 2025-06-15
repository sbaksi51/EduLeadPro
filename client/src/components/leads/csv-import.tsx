import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  X,
  Eye,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type User } from "@shared/schema";

interface CSVImportProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

interface ParsedLead {
  name: string;
  email?: string;
  phone: string;
  class: string;
  stream?: string;
  status: string;
  source: string;
  counselorId?: number;
  counselorName?: string;
  parentName?: string;
  parentPhone?: string;
  address?: string;
  lastContactedAt?: string;
  notes?: string;
  isValid: boolean;
  errors: string[];
}

export default function CSVImport({ onSuccess, onClose }: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedLead[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [activeTab, setActiveTab] = useState(() => {
    return window.location.hash.slice(1) || "upload";
  });
  const [validationResults, setValidationResults] = useState<{
    valid: number;
    invalid: number;
    total: number;
  }>({ valid: 0, invalid: 0, total: 0 });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: counselors } = useQuery<User[]>({
    queryKey: ["/api/counselors"],
  });

  const importMutation = useMutation({
    mutationFn: async (validLeads: ParsedLead[]) => {
      const response = await apiRequest("POST", "/api/leads/import-csv", { 
        csvData: validLeads.map(lead => ({
          name: lead.name,
          email: lead.email || "",
          phone: lead.phone,
          class: lead.class,
          stream: lead.stream || "",
          status: lead.status,
          source: lead.source,
          counselorId: lead.counselorId,
          parentName: lead.parentName || "",
          parentPhone: lead.parentPhone || "",
          address: lead.address || "",
          notes: lead.notes || "",
          lastContactedAt: lead.lastContactedAt
        }))
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Import Successful!",
        description: `Successfully imported ${data.leads?.length || 0} leads`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setFile(null);
      setParsedData([]);
      setActiveTab("upload");
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import leads from CSV",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "text/csv" || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select a CSV file",
          variant: "destructive",
        });
      }
    }
  };

  const validateLead = (lead: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!lead.name || lead.name.trim() === '') {
      errors.push("Student name is required");
    }

    if (!lead.phone || lead.phone.trim() === '') {
      errors.push("Phone number is required");
    } else if (lead.phone.length < 10) {
      errors.push("Phone number must be at least 10 digits");
    }

    if (!lead.class || lead.class.trim() === '') {
      errors.push("Class is required");
    }

    if (lead.email && lead.email.trim() !== '' && !lead.email.includes('@')) {
      errors.push("Invalid email format");
    }

    const validStatuses = ['new', 'contacted', 'interested', 'enrolled', 'dropped'];
    if (!lead.status || !validStatuses.includes(lead.status.toLowerCase())) {
      errors.push("Invalid status (must be: new, contacted, interested, enrolled, or dropped)");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const findCounselorByName = (counselorName: string): number | undefined => {
    if (!counselorName || !counselors) return undefined;
    
    const counselor = counselors.find(c => 
      c.name.toLowerCase().includes(counselorName.toLowerCase()) ||
      counselorName.toLowerCase().includes(c.name.toLowerCase())
    );
    
    return counselor?.id;
  };

  const processCSV = async () => {
    if (!file) return;

    setIsProcessing(true);
    setImportProgress(0);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error("CSV file must contain at least a header row and one data row");
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
      const dataLines = lines.slice(1);

      setImportProgress(25);

      const parsed: ParsedLead[] = [];
      
      for (let i = 0; i < dataLines.length; i++) {
        const values = dataLines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
        const row: any = {};
        
        // Map CSV headers to our schema
        headers.forEach((header, index) => {
          const value = values[index] || '';
          
          if (header.includes('name') && !header.includes('parent')) {
            row.name = value;
          } else if (header.includes('student') && header.includes('name')) {
            row.name = value;
          } else if (header.includes('email')) {
            row.email = value;
          } else if (header.includes('phone') && !header.includes('parent')) {
            row.phone = value;
          } else if (header.includes('class') || header.includes('grade')) {
            row.class = value;
          } else if (header.includes('stream') || header.includes('subject')) {
            row.stream = value;
          } else if (header.includes('status')) {
            row.status = value.toLowerCase();
          } else if (header.includes('source')) {
            row.source = value || 'csv_import';
          } else if (header.includes('counselor')) {
            row.counselorName = value;
            row.counselorId = findCounselorByName(value);
          } else if (header.includes('parent') && header.includes('name')) {
            row.parentName = value;
          } else if (header.includes('parent') && header.includes('phone')) {
            row.parentPhone = value;
          } else if (header.includes('address')) {
            row.address = value;
          } else if (header.includes('contact') || header.includes('last')) {
            row.lastContactedAt = value;
          } else if (header.includes('note') || header.includes('remark')) {
            row.notes = value;
          }
        });

        // Set defaults
        row.source = row.source || 'csv_import';
        row.status = row.status || 'new';

        const validation = validateLead(row);
        
        parsed.push({
          ...row,
          isValid: validation.isValid,
          errors: validation.errors
        });

        setImportProgress(25 + (i / dataLines.length) * 50);
      }

      const validCount = parsed.filter(lead => lead.isValid).length;
      const invalidCount = parsed.length - validCount;

      setValidationResults({
        valid: validCount,
        invalid: invalidCount,
        total: parsed.length
      });

      setParsedData(parsed);
      setImportProgress(100);
      setActiveTab("preview");

      toast({
        title: "CSV Processed",
        description: `Found ${validCount} valid leads and ${invalidCount} invalid entries`,
      });

    } catch (error: any) {
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process CSV file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    const validLeads = parsedData.filter(lead => lead.isValid);
    if (validLeads.length === 0) {
      toast({
        title: "No Valid Leads",
        description: "Please fix the validation errors before importing",
        variant: "destructive",
      });
      return;
    }

    importMutation.mutate(validLeads);
  };

  const downloadTemplate = () => {
    const template = [
      "name,email,phone,class,stream,status,source,counselor,parentName,parentPhone,address,lastContactedAt,notes",
      "John Doe,john@example.com,9876543210,Class 10,Science,new,website,Priya Sharma,Jane Doe,9876543211,123 Main St Mumbai,2024-01-15,Interested in science stream",
      "Jane Smith,jane@example.com,9876543212,Class 11,Commerce,contacted,google_ads,Rajesh Singh,Bob Smith,9876543213,456 Oak Ave Delhi,,Parent wants commerce focus",
      "Raj Patel,raj@example.com,9876543214,Class 12,Arts,interested,referral,Priya Sharma,Suresh Patel,9876543215,789 Pine St Pune,2024-01-10,Looking for arts subjects"
    ].join('\n');
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.location.hash = value;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Leads from CSV
            </CardTitle>
            <CardDescription>
              Upload a CSV file to import multiple leads with their details
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="preview" disabled={parsedData.length === 0}>
              Preview Data
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!importMutation.isSuccess}>
              Import Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
                <span className="text-sm text-muted-foreground">
                  Use this template to format your data correctly
                </span>
              </div>

              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  <strong>Required columns:</strong> name, phone, class<br/>
                  <strong>Optional columns:</strong> email, stream, status, source, counselor, parentName, parentPhone, address, lastContactedAt, notes
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="csv-file">Select CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={isProcessing}
                />
              </div>

              {file && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              )}

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Processing CSV file...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} />
                </div>
              )}

              <Button
                onClick={processCSV}
                disabled={!file || isProcessing}
                className="w-full"
              >
                {isProcessing ? "Processing..." : "Process CSV File"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Data Preview</h3>
                <p className="text-sm text-muted-foreground">
                  Review the parsed data before importing
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {validationResults.valid} Valid
                </Badge>
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {validationResults.invalid} Invalid
                </Badge>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Phone</th>
                      <th className="text-left p-2">Class</th>
                      <th className="text-left p-2">Stream</th>
                      <th className="text-left p-2">Counselor</th>
                      <th className="text-left p-2">Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.map((lead, index) => (
                      <tr key={index} className={`border-t ${lead.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
                        <td className="p-2">
                          {lead.isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                        </td>
                        <td className="p-2 font-medium">{lead.name}</td>
                        <td className="p-2">{lead.phone}</td>
                        <td className="p-2">{lead.class}</td>
                        <td className="p-2">{lead.stream || '-'}</td>
                        <td className="p-2">{lead.counselorName || '-'}</td>
                        <td className="p-2">
                          {lead.errors.length > 0 && (
                            <div className="text-xs text-red-600">
                              {lead.errors.join(', ')}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("upload")}>
                Back to Upload
              </Button>
              <Button
                onClick={handleImport}
                disabled={validationResults.valid === 0 || importMutation.isPending}
              >
                <Users className="h-4 w-4 mr-2" />
                {importMutation.isPending 
                  ? "Importing..." 
                  : `Import ${validationResults.valid} Valid Leads`
                }
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Import Completed Successfully!
              </h3>
              <p className="text-green-700 mb-4">
                All valid leads have been imported to your database
              </p>
              <Button onClick={() => {
                setActiveTab("upload");
                setParsedData([]);
                setFile(null);
              }}>
                Import More Leads
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}