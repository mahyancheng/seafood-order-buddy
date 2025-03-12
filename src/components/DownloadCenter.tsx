
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileUp, Download, File, FileText, PlusCircle, Trash2, Calendar, BarChart } from "lucide-react";
import { BrochureFile, handleFileUpload, formatFileSize, formatFileDate } from "@/utils/fileUtils";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

// Mock initial brochures for demonstration
const initialBrochures: BrochureFile[] = [
  {
    id: "brochure-1",
    name: "How Kee Products Catalog 2023.pdf",
    size: 2456789,
    type: "application/pdf",
    uploadDate: "2023-05-15T08:30:00Z",
    url: "#",
    downloadCount: 35
  },
  {
    id: "brochure-2",
    name: "Seasonal Products - Summer 2023.pdf",
    size: 1567890,
    type: "application/pdf",
    uploadDate: "2023-06-01T09:45:00Z",
    url: "#", 
    downloadCount: 27
  },
  {
    id: "brochure-3",
    name: "Price List Q3 2023.xlsx",
    size: 976543,
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    uploadDate: "2023-07-10T14:20:00Z",
    url: "#",
    downloadCount: 42
  }
];

const DownloadCenter: React.FC = () => {
  const { isAdmin } = useAuth();
  const [brochures, setBrochures] = useState<BrochureFile[]>(initialBrochures);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const { t, i18n } = useTranslation("global");

  const handleUploadSuccess = (newBrochure: BrochureFile) => {
    setBrochures([newBrochure, ...brochures]);
    setIsUploadDialogOpen(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0], handleUploadSuccess);
    }
  };

  const handleDownload = (brochure: BrochureFile) => {
    // In a real app, we'd increment the download count on the server
    // For now, we'll just update it locally
    const updatedBrochures = brochures.map(b => 
      b.id === brochure.id 
        ? { ...b, downloadCount: b.downloadCount + 1 } 
        : b
    );
    setBrochures(updatedBrochures);
    
    // Trigger download - in a real app, this would be a real URL
    window.open(brochure.url, '_blank');
    toast.success(`Downloading ${brochure.name}`);
  };

  const handleDelete = (brochureId: string) => {
    setBrochures(brochures.filter(b => b.id !== brochureId));
    toast.success("Brochure deleted successfully");
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return <FileText className="h-5 w-5 text-green-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
          <CardTitle>{t("downloadCenter.title")}</CardTitle>
          <CardDescription>{t("downloadCenter.description")}</CardDescription>
          </div>
          
          {isAdmin && (
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <FileUp className="h-4 w-4" />
                  {t("downloadCenter.upload_button")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("downloadCenter.upload_dialog_title")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:bg-secondary/50 transition-colors">
                    <input
                      type="file"
                      id="brochure-upload"
                      className="hidden"
                      onChange={handleFileInputChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                    />
                    <label htmlFor="brochure-upload" className="cursor-pointer w-full h-full block">
                      <PlusCircle className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-1">{t("downloadCenter.upload_instruction")}</p>
                    <p className="text-xs text-muted-foreground">{t("downloadCenter.upload_file_types")}</p>
                   </label>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full pr-4">
          <div className="space-y-1">
            {brochures.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
          {t("downloadCenter.no_brochures")}
              </div>
            ) : (
              brochures.map((brochure) => (
                <div key={brochure.id} className="p-3 rounded-lg hover:bg-secondary/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(brochure.type)}
                      <div>
                        <p className="font-medium text-sm">{brochure.name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span>{formatFileSize(brochure.size)}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatFileDate(brochure.uploadDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <BarChart className="h-3 w-3" />
                            {brochure.downloadCount} {t("downloadCenter.download_count")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1"
                        onClick={() => handleDownload(brochure)}
                      >
                        <Download className="h-3.5 w-3.5" />
                        {t("downloadCenter.download_button")}
                      </Button>
                      
                      {isAdmin && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(brochure.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DownloadCenter;
