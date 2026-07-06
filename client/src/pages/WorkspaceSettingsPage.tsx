import { useState, useEffect } from "react";
import { Users, Mail, Copy, Check, Shield, Trash2, Loader2, UserPlus } from "lucide-react";
import { workspaceApi } from "@/api/workspace.api";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";

export default function WorkspaceSettingsPage() {
  const { user: currentUser } = useAuthStore();
  const { activeWorkspace, members, setMembers } = useWorkspaceStore();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [isInviting, setIsInviting] = useState(false);
  const [invitationLink, setInvitationLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isLoadingInvites, setIsLoadingInvites] = useState(false);

  const currentUserRole = members.find((m) => m.userId._id === currentUser?._id)?.role;
  const isPrivileged = currentUserRole === "owner" || currentUserRole === "admin";

  const fetchInvitations = async () => {
    if (!activeWorkspace) return;
    setIsLoadingInvites(true);
    try {
      const { data } = await workspaceApi.getWorkspaceInvitations(activeWorkspace._id);
      setInvitations(data.data.invitations);
    } catch {
      toast.error("Failed to load invitations");
    } finally {
      setIsLoadingInvites(false);
    }
  };

  useEffect(() => {
    if (activeWorkspace && isPrivileged) {
      fetchInvitations();
    }
  }, [activeWorkspace, isPrivileged]);

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !activeWorkspace) return;
    setIsInviting(true);
    setInvitationLink("");
    try {
      const { data } = await workspaceApi.inviteUser(activeWorkspace._id, {
        email: inviteEmail,
        role: inviteRole,
      });
      setInvitationLink(data.data.inviteLink);
      toast.success("Invitation link generated!");
      setInviteEmail("");
      fetchInvitations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to invite user");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    if (!activeWorkspace) return;
    if (!confirm("Revoke this invitation? The link will no longer work.")) return;
    try {
      await workspaceApi.revokeInvitation(activeWorkspace._id, invitationId);
      toast.success("Invitation revoked");
      fetchInvitations();
    } catch {
      toast.error("Failed to revoke invitation");
    }
  };

  const handleCopy = () => {
    if (!invitationLink) return;
    navigator.clipboard.writeText(invitationLink);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!activeWorkspace) return;
    try {
      await workspaceApi.updateMemberRole(activeWorkspace._id, userId, { role: newRole });
      setMembers(members.map((m) => (m.userId._id === userId ? { ...m, role: newRole } : m)));
      toast.success("Role updated");
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!activeWorkspace) return;
    if (!confirm("Remove this collaborator from the laboratory?")) return;
    try {
      await workspaceApi.removeMember(activeWorkspace._id, userId);
      setMembers(members.filter((m) => m.userId._id !== userId));
      toast.success("Collaborator removed");
    } catch {
      toast.error("Failed to remove member");
    }
  };

  if (!activeWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-[#7a7a7a]">Select a workspace from the sidebar to manage settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Workspace Info */}
      <div className="rounded-[18px] bg-white dark:bg-[#272729] border border-[#e0e0e0] dark:border-[#333333] p-6 shadow-apple-product">
        <h1 className="text-[19px] font-semibold text-[#1d1d1f] dark:text-white tracking-tight-display">{activeWorkspace.name}</h1>
        <p className="text-[14px] text-[#7a7a7a] dark:text-[#cccccc] mt-0.5 leading-relaxed">
          {members.length} collaborator{members.length !== 1 ? "s" : ""}
          {currentUserRole && (
            <> · Your role: <span className="font-semibold capitalize text-[#1d1d1f] dark:text-white">{currentUserRole}</span></>
          )}
        </p>
      </div>

      {/* Invite */}
      <div className="rounded-[18px] bg-white dark:bg-[#272729] border border-[#e0e0e0] dark:border-[#333333] p-6 shadow-apple-product space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0066cc]/10 text-[#0066cc]">
            <UserPlus className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-white">Invite Collaborators</h2>
            <p className="text-[12px] text-[#7a7a7a] dark:text-[#cccccc]">Generate a secure invite link to add co-authors or PhD candidates</p>
          </div>
        </div>

        {isPrivileged ? (
          <form onSubmit={handleGenerateInvite} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="email"
              required
              placeholder="collaborator@university.edu"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 rounded-lg border border-[#e0e0e0] dark:border-[#333333] bg-[#f5f5f7] dark:bg-[#161617] px-3 py-2.5 text-sm text-[#1d1d1f] dark:text-white placeholder:text-[#7a7a7a] focus:border-[#0066cc] focus:bg-white dark:focus:bg-[#161617] focus:outline-none transition-colors"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="rounded-lg border border-[#e0e0e0] dark:border-[#333333] bg-[#f5f5f7] dark:bg-[#161617] px-3 py-2.5 text-sm text-[#1d1d1f] dark:text-white focus:border-[#0066cc] focus:bg-white dark:focus:bg-[#161617] focus:outline-none"
            >
              <option value="member">Researcher</option>
              <option value="manager">Lab Manager</option>
              <option value="admin">Administrator</option>
            </select>
            <button
              type="submit"
              disabled={isInviting}
              className="flex items-center justify-center gap-1.5 rounded-full bg-[#0066cc] hover:bg-[#0071e3] px-5 py-2.5 text-sm font-medium text-white transition-all active-scale disabled:opacity-50"
            >
              {isInviting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Generate Link
            </button>
          </form>
        ) : (
          <div className="rounded-[11px] border border-[#ffdbdb] bg-[#ffdbdb]/20 px-4 py-3 text-sm text-[#ff3b30]">
            Only Principal Investigators or Administrators can generate invitation links.
          </div>
        )}

        {invitationLink && (
          <div className="rounded-[11px] border border-[#e0e0e0] dark:border-[#333333] bg-[#f5f5f7] dark:bg-[#161617] p-3 space-y-2">
            <p className="text-[12px] font-semibold text-[#1d1d1f] dark:text-white">Share this link with the invited collaborator:</p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={invitationLink}
                className="flex-1 rounded-lg border border-[#e0e0e0] dark:border-[#333333] bg-white dark:bg-[#272729] px-3 py-2 text-xs text-[#7a7a7a] dark:text-[#cccccc] focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-full border border-[#e0e0e0] dark:border-[#333333] bg-white dark:bg-[#272729] px-4 py-2 text-xs font-medium text-[#1d1d1f] dark:text-white hover:bg-[#f5f5f7] dark:hover:bg-[#161617] transition-all active-scale"
              >
                {copied ? (
                  <><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied</>
                ) : (
                  <><Copy className="h-3.5 w-3.5" /> Copy</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pending Invitations */}
      {isPrivileged && invitations.filter(inv => inv.status === "pending").length > 0 && (
        <div className="rounded-[18px] bg-white dark:bg-[#272729] border border-[#e0e0e0] dark:border-[#333333] p-6 shadow-apple-product space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0066cc]/10 text-[#0066cc]">
              <Mail className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-white">Pending Invitations</h2>
              <p className="text-[12px] text-[#7a7a7a] dark:text-[#cccccc]">Invited collaborators who haven't joined yet</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#1d1d1f] dark:text-white">
              <thead>
                <tr className="border-b border-[#e0e0e0] dark:border-[#333333]">
                  <th className="pb-3 pr-4 text-[10px] font-semibold uppercase tracking-widest text-[#7a7a7a] dark:text-[#cccccc]">Email</th>
                  <th className="pb-3 pr-4 text-[10px] font-semibold uppercase tracking-widest text-[#7a7a7a] dark:text-[#cccccc]">Role</th>
                  <th className="pb-3 pr-4 text-[10px] font-semibold uppercase tracking-widest text-[#7a7a7a] dark:text-[#cccccc]">Expires</th>
                  <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-widest text-[#7a7a7a] dark:text-[#cccccc]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e0e0] dark:divide-[#333333]">
                {invitations
                  .filter((inv) => inv.status === "pending")
                  .map((inv) => {
                    const expires = new Date(inv.expiresAt);
                    const isExpired = expires < new Date();
                    return (
                      <tr key={inv._id} className="align-middle hover:bg-[#f5f5f7] dark:hover:bg-[#161617]/50 transition-colors">
                        <td className="py-3 pr-4 font-semibold text-[#1d1d1f] dark:text-white text-sm">{inv.email}</td>
                        <td className="py-3 pr-4">
                          <span className="rounded-full bg-[#f5f5f7] dark:bg-[#161617] px-2.5 py-1 text-[11px] font-semibold capitalize text-[#515154] dark:text-[#cccccc]">
                            {inv.role}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-xs text-[#7a7a7a] dark:text-[#cccccc]">
                          {isExpired ? (
                            <span className="text-[#ff3b30] font-semibold">Expired</span>
                          ) : (
                            expires.toLocaleDateString() + " " + expires.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          )}
                        </td>
                        <td className="py-3 text-right flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              const link = `${window.location.origin}/join/${inv.token}`;
                              navigator.clipboard.writeText(link);
                              toast.success("Invite link copied to clipboard!");
                            }}
                            className="rounded-lg p-1.5 text-[#7a7a7a] hover:bg-[#e0e0e0] dark:hover:bg-[#272729] hover:text-[#1d1d1f] dark:hover:text-white transition-colors"
                            title="Copy link"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRevokeInvitation(inv._id)}
                            className="rounded-lg p-1.5 text-[#ff3b30] hover:bg-[#ff3b30]/10 transition-colors"
                            title="Revoke invitation"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Members Table */}
      <div className="rounded-[18px] bg-white dark:bg-[#272729] border border-[#e0e0e0] dark:border-[#333333] p-6 shadow-apple-product space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0066cc]/10 text-[#0066cc]">
            <Users className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-white">Collaborators</h2>
            <p className="text-[12px] text-[#7a7a7a] dark:text-[#cccccc]">{members.length} people in this laboratory</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#1d1d1f] dark:text-white">
            <thead>
              <tr className="border-b border-[#e0e0e0] dark:border-[#333333]">
                <th className="pb-3 pr-4 text-[10px] font-semibold uppercase tracking-widest text-[#7a7a7a] dark:text-[#cccccc]">User</th>
                <th className="pb-3 pr-4 text-[10px] font-semibold uppercase tracking-widest text-[#7a7a7a] dark:text-[#cccccc]">Email</th>
                <th className="pb-3 pr-4 text-[10px] font-semibold uppercase tracking-widest text-[#7a7a7a] dark:text-[#cccccc]">Role</th>
                {isPrivileged && (
                  <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-widest text-[#7a7a7a] dark:text-[#cccccc]">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e0e0] dark:divide-[#333333]">
              {members.map((m) => {
                const isSelf = m.userId._id === currentUser?._id;
                const isOwner = m.role === "owner";
                return (
                  <tr key={m.userId._id} className="align-middle hover:bg-[#f5f5f7] dark:hover:bg-[#161617]/50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={m.userId.avatar}
                          alt={m.userId.name}
                          className="h-8 w-8 rounded-full border border-[#e0e0e0] dark:border-[#333333]"
                        />
                        <div>
                          <p className="font-semibold text-[#1d1d1f] dark:text-white text-sm">
                            {m.userId.name}
                            {isSelf && <span className="ml-1 text-[10px] text-[#7a7a7a] dark:text-[#cccccc]">(you)</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-sm text-[#7a7a7a] dark:text-[#cccccc]">{m.userId.email}</td>
                    <td className="py-3 pr-4">
                      {isOwner ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/20 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                          <Shield className="h-3 w-3" />
                          PI / Owner
                        </span>
                      ) : isPrivileged && !isSelf ? (
                        <select
                          value={m.role}
                          onChange={(e) => handleUpdateRole(m.userId._id, e.target.value)}
                          className="rounded-lg border border-[#e0e0e0] dark:border-[#333333] bg-[#f5f5f7] dark:bg-[#161617] px-2 py-1 text-xs text-[#1d1d1f] dark:text-white focus:border-[#0066cc] focus:outline-none"
                        >
                          <option value="member">Researcher</option>
                          <option value="manager">Lab Manager</option>
                          <option value="admin">Administrator</option>
                        </select>
                      ) : (
                        <span className="rounded-full bg-[#f5f5f7] dark:bg-[#161617] px-2.5 py-1 text-[11px] font-semibold capitalize text-[#515154] dark:text-[#cccccc]">
                          {m.role === "member" ? "Researcher" : m.role === "manager" ? "Lab Manager" : m.role}
                        </span>
                      )}
                    </td>
                    {isPrivileged && (
                      <td className="py-3 text-right">
                        {!isSelf && !isOwner && (
                          <button
                            onClick={() => handleRemoveMember(m.userId._id)}
                            className="rounded-lg p-1.5 text-[#ff3b30] hover:bg-[#ff3b30]/10 transition-colors"
                            title="Remove member"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
