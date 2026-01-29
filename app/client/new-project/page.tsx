"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProjectPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [includeHosting, setIncludeHosting] = useState(false);
  const [needsDocumentation, setNeedsDocumentation] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const calculateEstimate = () => {
    // New pricing model:
    // ₵1,500 (base price with documentation ready)
    // +₵800 if documentation needs to be created
    // +₵350 for hosting
    // +₵250 for multiple files (>3)

    const basePrice = 1500;
    const documentationCost = 800;

    let totalCost = basePrice;

    // Add documentation cost if needed
    if (needsDocumentation) {
      totalCost += documentationCost;
    }

    // Add hosting cost
    if (includeHosting) {
      totalCost += 350;
    }

    // Add file handling cost if many files
    if (files.length > 3) {
      totalCost += 250;
    }

    return totalCost;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Clear files if documentation is needed (since upload section is hidden)
      const filesToUpload = needsDocumentation ? [] : files;

      // Ensure user record exists using API route with service role
      const ensureUserResponse = await fetch("/api/ensure-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          fullName: user.user_metadata?.full_name || "",
          role: "client",
        }),
      });

      if (!ensureUserResponse.ok) {
        const errorText = await ensureUserResponse.text();
        console.error(
          "Ensure user error:",
          ensureUserResponse.status,
          errorText,
        );
        toast.error("Failed to verify user account. Please try again.");
        return;
      }

      const ensureUserData = await ensureUserResponse.json();

      if (ensureUserData.error) {
        console.error("Ensure user error:", ensureUserData);
        throw new Error(
          ensureUserData.error || "Failed to verify user account",
        );
      }

      console.log("User ensured:", ensureUserData);

      const estimatedCost = calculateEstimate();

      // Create project
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          client_id: user.id,
          title,
          description,
          requirements,
          include_hosting: includeHosting,
          needs_documentation: needsDocumentation,
          estimated_cost: estimatedCost,
          status: "pending_review",
        } as any)
        .select()
        .single();

      if (projectError) {
        console.error("Project creation error:", projectError);
        throw projectError;
      }

      const projectData = project as any;

      // Upload files if any (only when documentation is not needed)
      if (filesToUpload.length > 0 && project) {
        console.log("Uploading files:", filesToUpload.length);
        for (const file of filesToUpload) {
          const fileName = `${projectData.id}/${Date.now()}-${file.name}`;
          console.log("Uploading file to storage:", fileName);

          const { data: fileData, error: uploadError } = await supabase.storage
            .from("project-files")
            .upload(fileName, file);

          if (uploadError) {
            console.error("File upload error:", uploadError);
            toast.error(
              `Failed to upload ${file.name}: ${uploadError.message}`,
            );
            continue;
          }

          if (fileData) {
            console.log("File uploaded successfully:", fileData.path);
            const {
              data: { publicUrl },
            } = supabase.storage
              .from("project-files")
              .getPublicUrl(fileData.path);

            console.log("Inserting file record to database:", file.name);
            const { error: dbError } = await supabase
              .from("project_files")
              .insert({
                project_id: projectData.id,
                uploaded_by: user.id,
                file_name: file.name,
                file_url: publicUrl,
                file_type: file.type,
                file_size: file.size,
              } as any);

            if (dbError) {
              console.error("Database insert error:", dbError);
              toast.error(
                `Failed to save ${file.name} record: ${dbError.message}`,
              );
            } else {
              console.log("File record saved successfully:", file.name);
            }
          }
        }
      }

      toast.success("Project submitted successfully!");
      router.push(`/client/projects/${projectData.id}`);
    } catch (error: any) {
      console.error("Full error:", error);
      toast.error(error.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-8">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/client">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-electric-blue"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Create New Project</h1>
          <p className="text-slate-300">Tell us about your website project</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-slate-panel border-slate-border">
          <CardHeader className="bg-gradient-to-r from-navy-900/50 to-navy-800/50 border-b border-slate-border">
            <CardTitle className="text-white">Project Details</CardTitle>
            <CardDescription className="text-slate-300">
              Provide information about your website project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">
                Project Title *
              </Label>
              <Input
                id="title"
                placeholder="e.g., E-commerce Website for Fashion Store"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-slate-card border-slate-border text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Briefly describe what you want to build..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-slate-card border-slate-border text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements" className="text-white">
                Detailed Requirements *
              </Label>
              <Textarea
                id="requirements"
                placeholder="List specific features, pages, functionality, design preferences, etc."
                rows={6}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="bg-slate-card border-slate-border text-white"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="needsDocumentation"
                checked={needsDocumentation}
                onChange={(e) => setNeedsDocumentation(e.target.checked)}
                className="rounded border-slate-border"
              />
              <Label
                htmlFor="needsDocumentation"
                className="cursor-pointer text-white"
              >
                We need documentation created
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hosting"
                checked={includeHosting}
                onChange={(e) => setIncludeHosting(e.target.checked)}
                className="rounded border-slate-border"
              />
              <Label htmlFor="hosting" className="cursor-pointer text-white">
                Include hosting and deployment
              </Label>
            </div>
          </CardContent>
        </Card>

        {!needsDocumentation && (
          <Card className="bg-slate-panel border-slate-border">
            <CardHeader className="bg-gradient-to-r from-navy-900/50 to-navy-800/50 border-b border-slate-border">
              <CardTitle className="text-white">Upload Documentation</CardTitle>
              <CardDescription className="text-slate-300">
                Upload any relevant files (wireframes, designs, documents)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-border rounded-lg cursor-pointer hover:bg-slate-card">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-slate-400" />
                      <p className="mb-2 text-sm text-slate-300">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-slate-400">
                        PDF, DOC, images up to 10MB
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                    />
                  </label>
                </div>
                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-slate-card rounded border border-slate-border"
                      >
                        <span className="text-sm text-white">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-slate-300 hover:text-white"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="bg-gradient-to-r from-electric-blue to-electric-cyan hover:from-electric-blue/90 hover:to-electric-cyan/90 text-white font-semibold shadow-lg shadow-electric-blue/30"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-electric-blue to-electric-cyan hover:from-electric-blue/90 hover:to-electric-cyan/90 text-white font-semibold shadow-lg shadow-electric-blue/30"
          >
            {loading ? "Submitting..." : "Submit Project"}
          </Button>
        </div>
      </form>
    </div>
  );
}
