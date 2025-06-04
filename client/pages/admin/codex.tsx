import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PixelButton } from "@/components/ui/pixel-button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Types
interface ShrineSubmission {
  id: string;
  text: string;
  source: string;
  type: string;
  timestamp: string;
  reviewed: boolean;
}

interface ShrineOffering {
  id: string;
  text: string;
  source: string;
  type: string;
  timestamp: string;
}

interface GaruEgg {
  id: string;
  name: string;
  type: string;
  elementalAffinity: string;
  color: string;
  timestamp: string;
  offeringId: string;
}

export default function AdminCodexPage() {
  const [pendingSubmissions, setPendingSubmissions] = useState<ShrineSubmission[]>([]);
  const [approvedOfferings, setApprovedOfferings] = useState<ShrineOffering[]>([]);
  const [eggs, setEggs] = useState<GaruEgg[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [directText, setDirectText] = useState("");
  const [directSource, setDirectSource] = useState("");
  const [directType, setDirectType] = useState("admin");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    // Set document title
    document.title = "Codex Admin - Chicken Jockey Scribe Racer";
    
    // Load data
    loadData();
  }, []);
  
  const loadData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch pending submissions
      const submissionsResponse = await apiRequest('GET', '/api/shrine/admin/submissions');
      const submissionsData = await submissionsResponse.json();
      setPendingSubmissions(submissionsData.submissions || []);
      
      // Fetch approved offerings
      const offeringsResponse = await apiRequest('GET', '/api/shrine/offerings');
      const offeringsData = await offeringsResponse.json();
      setApprovedOfferings(offeringsData.offerings || []);
      
      // Fetch eggs
      const eggsResponse = await apiRequest('GET', '/api/shrine/eggs');
      const eggsData = await eggsResponse.json();
      setEggs(eggsData.eggs || []);
    } catch (error) {
      console.error("Error loading codex admin data:", error);
      toast({
        title: "Error",
        description: "Failed to load admin data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApproveSubmission = async (submissionId: string) => {
    try {
      const response = await apiRequest('POST', `/api/shrine/admin/approve/${submissionId}`);
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Approved",
          description: "Submission has been approved and an egg has been generated."
        });
        
        // Refresh data
        loadData();
      }
    } catch (error) {
      console.error("Error approving submission:", error);
      toast({
        title: "Error",
        description: "Failed to approve submission.",
        variant: "destructive"
      });
    }
  };
  
  const handleRejectSubmission = async (submissionId: string) => {
    try {
      const response = await apiRequest('POST', `/api/shrine/admin/reject/${submissionId}`);
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Rejected",
          description: "Submission has been rejected."
        });
        
        // Refresh data
        loadData();
      }
    } catch (error) {
      console.error("Error rejecting submission:", error);
      toast({
        title: "Error",
        description: "Failed to reject submission.",
        variant: "destructive"
      });
    }
  };
  
  const handleDirectUpload = async () => {
    if (!directText.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('POST', '/api/shrine/admin/direct-upload', {
        text: directText,
        source: directSource || "Admin",
        type: directType
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Text has been added to the Codex and an egg has been generated."
        });
        
        // Reset form
        setDirectText("");
        setDirectSource("");
        
        // Refresh data
        loadData();
      }
    } catch (error) {
      console.error("Error with direct upload:", error);
      toast({
        title: "Error",
        description: "Failed to add text to the Codex.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto p-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-minecraft text-primary">CODEX CRUCIBLE ADMIN</h1>
            <PixelButton onClick={loadData} disabled={isLoading}>
              {isLoading ? "Loading..." : "Refresh Data"}
            </PixelButton>
          </div>
          
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">Pending Submissions</TabsTrigger>
              <TabsTrigger value="approved">Approved Offerings</TabsTrigger>
              <TabsTrigger value="upload">Direct Upload</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="pt-4">
              <h2 className="text-xl font-minecraft text-primary mb-4">Pending Submissions</h2>
              
              {pendingSubmissions.length === 0 ? (
                <p className="text-center text-gray-400 my-8">No pending submissions found.</p>
              ) : (
                <div className="space-y-4">
                  {pendingSubmissions.map((submission) => (
                    <Card key={submission.id} className="bg-dark/50">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-bold text-primary">From: {submission.source}</span>
                            <span className="text-xs text-gray-400 ml-2">({submission.type})</span>
                          </div>
                          <span className="text-xs text-gray-400">{formatDate(submission.timestamp)}</span>
                        </div>
                        
                        <div className="bg-black/40 p-3 rounded mb-4 max-h-40 overflow-y-auto">
                          <p className="text-gray-200 whitespace-pre-line">{submission.text}</p>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <PixelButton
                            variant="destructive"
                            onClick={() => handleRejectSubmission(submission.id)}
                          >
                            Reject
                          </PixelButton>
                          <PixelButton
                            onClick={() => handleApproveSubmission(submission.id)}
                          >
                            Approve
                          </PixelButton>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="approved" className="pt-4">
              <h2 className="text-xl font-minecraft text-primary mb-4">Approved Offerings</h2>
              
              {approvedOfferings.length === 0 ? (
                <p className="text-center text-gray-400 my-8">No approved offerings found.</p>
              ) : (
                <div className="space-y-4">
                  {approvedOfferings.map((offering) => (
                    <Card key={offering.id} className="bg-dark/50">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-bold text-primary">From: {offering.source}</span>
                            <span className="text-xs text-gray-400 ml-2">({offering.type})</span>
                          </div>
                          <span className="text-xs text-gray-400">{formatDate(offering.timestamp)}</span>
                        </div>
                        
                        <div className="bg-black/40 p-3 rounded mb-4 max-h-40 overflow-y-auto">
                          <p className="text-gray-200 whitespace-pre-line">{offering.text}</p>
                        </div>
                        
                        {/* Find related eggs */}
                        {eggs.filter(egg => egg.offeringId === offering.id).map(egg => (
                          <div key={egg.id} className="mt-2 p-2 border border-primary/30 rounded bg-black/30">
                            <div className="flex items-center">
                              <div className="w-6 h-6 rounded-full bg-primary mr-2"></div>
                              <div>
                                <p className="text-sm font-bold text-primary">{egg.name}</p>
                                <p className="text-xs text-gray-400">{egg.type} • {egg.elementalAffinity}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="upload" className="pt-4">
              <h2 className="text-xl font-minecraft text-primary mb-4">Direct Upload</h2>
              
              <Card className="bg-dark/50">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="direct-source">Source/Author</Label>
                      <Input
                        id="direct-source"
                        value={directSource}
                        onChange={(e) => setDirectSource(e.target.value)}
                        placeholder="Admin"
                        className="bg-black/70 border-primary"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="direct-type">Content Type</Label>
                      <Select
                        value={directType}
                        onValueChange={setDirectType}
                      >
                        <SelectTrigger className="bg-black/70 border-primary">
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin Curated</SelectItem>
                          <SelectItem value="lore">Game Lore</SelectItem>
                          <SelectItem value="poem">Poetry</SelectItem>
                          <SelectItem value="story">Story</SelectItem>
                          <SelectItem value="wisdom">Wisdom/Quote</SelectItem>
                          <SelectItem value="gutenberg">Project Gutenberg</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="direct-text">Text Content</Label>
                      <Textarea
                        id="direct-text"
                        value={directText}
                        onChange={(e) => setDirectText(e.target.value)}
                        placeholder="Enter the text to add directly to the Codex..."
                        className="bg-black/70 border-primary h-60"
                      />
                    </div>
                    
                    <div className="pt-2">
                      <PixelButton
                        onClick={handleDirectUpload}
                        disabled={isSubmitting || !directText.trim()}
                        className="w-full"
                      >
                        {isSubmitting ? "Uploading..." : "Add to Codex"}
                      </PixelButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}