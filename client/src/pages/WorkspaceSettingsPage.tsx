import { useState } from "react";
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

  const currentUserRole = members.find((m) => m.userId._id === currentUser?._id)?.role;
  const isPrivileged = currentUserRole === "owner" || currentUserRole === "admin";

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
      setInvitationLink(data.data.invitationUrl);
      toast.success("Invitation link generated!");
      setInviteEmail("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to invite user");
    } finally {
      setIsInviting(false);
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
    if (!confirm("Remove this member from the workspace?")) return;
    try {
      await workspaceApi.removeMember(activeWorkspace._id, userId);
      setMembers(members.filter((m) => m.userId._id !== userId));
      toast.success("Member removed");
    } catch {
      toast.error("Failed to remove member");
    }
  };

  if (!activeWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-graphite">Select a workspace from the sidebar to manage settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Workspace Info */}
      <div className="rounded-xl bg-card border border-hairline shadow-soft-lift p-6">
        <h1 className="text-lg font-bold text-ink">{activeWorkspace.name}</h1>
        <p className="text-sm text-graphite mt-0.5">
          {members.length} member{members.length !== 1 ? "s" : ""}
          {currentUserRole && (
            <> · Your role: <span className="font-semibold capitalize text-ink">{currentUserRole}</span></>
          )}
        </p>
      </div>

      {/* Invite */}
      <div className="rounded-xl bg-card border border-hairline shadow-soft-lift p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8">
            <UserPlus className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-ink">Invite Members</h2>
            <p className="text-xs text-graphite">Generate a secure invite link to add someone</p>
          </div>
        </div>

        {isPrivileged ? (
          <form onSubmit={handleGenerateInvite} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="email"
              required
              placeholder="member@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 rounded-lg border border-hairline bg-cloud px-3 py-2.5 text-sm text-ink placeholder:text-graphite focus:border-primary focus:bg-card focus:outline-none transition-colors"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="rounded-lg border border-hairline bg-cloud px-3 py-2.5 text-sm text-ink focus:border-primary focus:bg-card focus:outline-none"
            >
              <option value="member">Member</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              disabled={isInviting}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-deep disabled:opacity-50 transition-colors"
            >
              {isInviting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Generate Link
            </button>
          </form>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Only workspace Owners or Admins can generate invitation links.
          </div>
        )}

        {invitationLink && (
          <div className="rounded-lg border border-hairline bg-cloud p-3 space-y-2">
            <p className="text-xs font-semibold text-ink">Share this link with the invited member:</p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={invitationLink}
                className="flex-1 rounded-lg border border-hairline bg-card px-3 py-2 text-xs text-graphite focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg border border-hairline bg-card px-3 py-2 text-xs font-semibold text-ink hover:bg-cloud transition-colors"
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

      {/* Members Table */}
      <div className="rounded-xl bg-card border border-hairline shadow-soft-lift p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-ink">Team Members</h2>
            <p className="text-xs text-graphite">{members.length} people in this workspace</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-hairline">
                <th className="pb-3 pr-4 text-[11px] font-semibold uppercase tracking-widest text-graphite">User</th>
                <th className="pb-3 pr-4 text-[11px] font-semibold uppercase tracking-widest text-graphite">Email</th>
                <th className="pb-3 pr-4 text-[11px] font-semibold uppercase tracking-widest text-graphite">Role</th>
                {isPrivileged && (
                  <th className="pb-3 text-right text-[11px] font-semibold uppercase tracking-widest text-graphite">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {members.map((m) => {
                const isSelf = m.userId._id === currentUser?._id;
                const isOwner = m.role === "owner";
                return (
                  <tr key={m.userId._id} className="align-middle hover:bg-cloud/50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={m.userId.avatar}
                          alt={m.userId.name}
                          className="h-8 w-8 rounded-full border border-hairline"
                        />
                        <div>
                          <p className="font-semibold text-ink text-sm">
                            {m.userId.name}
                            {isSelf && <span className="ml-1 text-[10px] text-graphite">(you)</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-sm text-graphite">{m.userId.email}</td>
                    <td className="py-3 pr-4">
                      {isOwner ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                          <Shield className="h-3 w-3" />
                          Owner
                        </span>
                      ) : isPrivileged && !isSelf ? (
                        <select
                          value={m.role}
                          onChange={(e) => handleUpdateRole(m.userId._id, e.target.value)}
                          className="rounded-lg border border-hairline bg-cloud px-2 py-1 text-xs text-ink focus:border-primary focus:outline-none"
                        >
                          <option value="member">Member</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className="rounded-full bg-cloud px-2.5 py-1 text-[11px] font-semibold capitalize text-charcoal">
                          {m.role}
                        </span>
                      )}
                    </td>
                    {isPrivileged && (
                      <td className="py-3 text-right">
                        {!isSelf && !isOwner && (
                          <button
                            onClick={() => handleRemoveMember(m.userId._id)}
                            className="rounded-lg p-1.5 text-graphite hover:bg-bloom-rose/30 hover:text-bloom-deep transition-colors"
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
