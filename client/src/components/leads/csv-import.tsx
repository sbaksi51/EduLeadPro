import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CSVImportProps {
  onSuccess?: () => void;
}

export default function CSVImport({ onSuccess }: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (csvData: any[]) => {
      const response = await apiRequest("/api/leads/import-csv", "POST", { csvData });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Import successful",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setFile(null);
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Import failed",
        description: "Failed to import leads from CSV",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a CSV file",
        variant: "destructive",
      });
    }
  };

  const processCSV = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const csvData = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: any = {};
        
        headers.forEach((header, index) => {
          // Map common CSV headers to our schema
          const normalizedHeader = header.replace(/['"]/g, '');
          if (normalizedHeader.includes('name')) row.name = values[index]?.replace(/['"]/g, '');
          if (normalizedHeader.includes('email')) row.email = values[index]?.replace(/['"]/g, '');
          if (normalizedHeader.includes('phone')) row.phone = values[index]?.replace(/['"]/g, '');
          if (normalizedHeader.includes('class') || normalizedHeader.includes('grade')) row.class = values[index]?.replace(/['"]/g, '');
          if (normalizedHeader.includes('stream')) row.stream = values[index]?.replace(/['"]/g, '');
          if (normalizedHeader.includes('status')) row.status = values[index]?.replace(/['"]/g, '');
          if (normalizedHeader.includes('source')) row.source = values[index]?.replace(/['"]/g, '');
          if (normalizedHeader.includes('parent')) row.parentName = values[index]?.replace(/['"]/g, '');
          if (normalizedHeader.includes('address')) row.address = values[index]?.replace(/['"]/g, '');
          if (normalizedHeader.includes('counselor')) row.counselorId = parseInt(values[index]?.replace(/['"]/g, '')) || 2;
          if (normalizedHeader.includes('contacted') || normalizedHeader.includes('lastcontacted')) {
            const dateValue = values[index]?.replace(/['"]/g, '');
            if (dateValue) row.lastContacted = new Date(dateValue).toISOString();
          }
        });
        
        return row;
      }).filter(row => row.name); // Only include rows with names

      importMutation.mutate(csvData);
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "Failed to process CSV file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const template = "name,email,phone,class,stream,status,source,parentName,address,counselor,lastContacted\n" +
                    "John Doe,john@example.com,9876543210,Grade 10,Science,new,website,Jane Doe,123 Main St,2,2024-06-01\n" +
                    "Jane Smith,jane@example.com,9876543211,Grade 12,Commerce,warm,referral,Bob Smith,456 Oak Ave,3,2024-06-05";
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Leads from CSV
        </CardTitle>
        <CardDescription>
          Upload a CSV file to import multiple leads at once
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
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

        <div className="space-y-2">
          <Label htmlFor="csv-file">Select CSV File</Label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={importMutation.isPending || isProcessing}
          />
        </div>

        {file && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded">
            <FileText className="h-4 w-4" />
            <span className="text-sm">{file.name}</span>
          </div>
        )}

        <Button
          onClick={processCSV}
          disabled={!file || importMutation.isPending || isProcessing}
          className="w-full"
        >
          {isProcessing ? "Processing..." : importMutation.isPending ? "Importing..." : "Import Leads"}
        </Button>
      </CardContent>
    </Card>
  );
}