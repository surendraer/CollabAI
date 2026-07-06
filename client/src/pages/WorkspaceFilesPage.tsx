import { useState, useEffect } from "react";
import { Folder, Upload, Download, Trash2, Loader2, File, FileCode, FileSpreadsheet, FileText, Image } from "lucide-react";
import { fileApi } from "@/api/file.api";
import { useWorkspaceStore } from "@/store/workspace.store";
import toast from "react-hot-toast";

export default function WorkspaceFilesPage() {
  const { activeWorkspace, files, setFiles } = useWorkspaceStore();
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (activeWorkspace) {
      fetchFiles();
    }
  }, [activeWorkspace]);

  const fetchFiles = async () => {
    if (!activeWorkspace) return;
    try {
      const { data } = await fileApi.getWorkspaceFiles(activeWorkspace._id);
      setFiles(data.data.files);
    } catch {
      toast.error("Failed to load files");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeWorkspace) return;

    // Check size limit: max 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Max size limit is 10MB.");
      return;
    }

    setIsUploading(true);
    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        try {
          const { data } = await fileApi.uploadFile(activeWorkspace._id, {
            fileData: base64Data,
            fileName: file.name,
          });
          setFiles([data.data.file, ...files]);
          toast.success("File uploaded successfully!");
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Failed to upload file");
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Failed to read file");
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!activeWorkspace) return;
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      await fileApi.deleteFile(activeWorkspace._id, fileId);
      setFiles(files.filter(f => f._id !== fileId));
      toast.success("File deleted");
    } catch {
      toast.error("Failed to delete file");
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Image className="h-5 w-5 text-blue-500" />;
    if (mimeType.includes("pdf")) return <FileText className="h-5 w-5 text-rose-500" />;
    if (mimeType.includes("spreadsheet") || mimeType.includes("csv")) return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
    if (mimeType.includes("javascript") || mimeType.includes("json") || mimeType.includes("python")) return <FileCode className="h-5 w-5 text-amber-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!activeWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-[#7a7a7a]">Select a workspace to view files.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[18px] bg-white dark:bg-[#272729] border border-[#e0e0e0] dark:border-[#333333] p-6 shadow-apple-product space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e0e0] dark:border-[#333333]">
        <div>
          <h1 className="text-lg font-semibold text-[#1d1d1f] dark:text-white">Shared File Cabinet</h1>
          <p className="text-xs text-[#7a7a7a] mt-0.5">Upload and share research papers, reference PDFs, datasets, and code outputs</p>
        </div>

        <label className="flex items-center justify-center gap-1.5 rounded-full bg-[#0066cc] hover:bg-[#0071e3] px-5 py-2.5 text-sm font-semibold text-white cursor-pointer transition-all active-scale self-start sm:self-auto">
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <span>Upload Document</span>
          <input
            type="file"
            onChange={handleUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Folder className="h-10 w-10 text-[#7a7a7a] mb-2" />
            <p className="text-sm font-semibold text-[#1d1d1f] dark:text-white">File cabinet is empty</p>
            <p className="text-xs text-[#7a7a7a] mt-0.5">Upload resource PDFs or dataset outputs to get started.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-[#1d1d1f] dark:text-white">
            <thead>
              <tr className="border-b border-[#e0e0e0] dark:border-[#333333]">
                <th className="pb-3 pr-4 text-[10px] font-semibold uppercase tracking-widest text-[#7a7a7a] dark:text-[#cccccc]">File Name</th>
                <th className="pb-3 pr-4 text-[10px] font-semibold uppercase tracking-widest text-[#7a7a7a] dark:text-[#cccccc]">Size</th>
                <th className="pb-3 pr-4 text-[10px] font-semibold uppercase tracking-widest text-[#7a7a7a] dark:text-[#cccccc]">Uploaded By</th>
                <th className="pb-3 pr-4 text-[10px] font-semibold uppercase tracking-widest text-[#7a7a7a] dark:text-[#cccccc]">Upload Date</th>
                <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-widest text-[#7a7a7a] dark:text-[#cccccc]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e0e0] dark:divide-[#333333]">
              {files.map((file) => (
                <tr key={file._id} className="align-middle hover:bg-[#f5f5f7] dark:hover:bg-[#161617]/50 transition-colors">
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-2.5 min-w-0 max-w-md">
                      {getFileIcon(file.mimeType)}
                      <span className="font-semibold text-sm truncate">{file.originalName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 text-xs text-[#7a7a7a] dark:text-[#cccccc]">{formatBytes(file.sizeBytes)}</td>
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={file.uploadedBy?.avatar}
                        alt={file.uploadedBy?.name}
                        className="h-6 w-6 rounded-full border border-[#e0e0e0] dark:border-[#333333]"
                      />
                      <span className="text-xs">{file.uploadedBy?.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 text-xs text-[#7a7a7a] dark:text-[#cccccc]">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 text-right flex items-center justify-end gap-1.5">
                    <a
                      href={file.storageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-1.5 text-[#7a7a7a] hover:bg-[#f5f5f7] dark:hover:bg-[#161617] hover:text-[#1d1d1f] dark:hover:text-white transition-colors"
                      title="Download File"
                    >
                      <Download className="h-4.5 w-4.5" />
                    </a>
                    <button
                      onClick={() => handleDeleteFile(file._id)}
                      className="rounded-lg p-1.5 text-[#ff3b30] hover:bg-[#ff3b30]/10 transition-colors"
                      title="Delete File"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
