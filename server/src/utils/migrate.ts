// ============================================================
// utils/migrate.ts
// Handles migration of old CollabAI schema data to the new
// Research Collab schema: Lab containers, custom PipelineStages,
// stage-mapping for tasks, and lab membership matching.
// Runs automatically on server startup.
// ============================================================
import Lab from "../models/lab.model";
import LabMember from "../models/labMember.model";
import Workspace from "../models/workspace.model";
import Member from "../models/member.model";
import Task from "../models/task.model";
import PipelineStage from "../models/pipelineStage.model";
import User from "../models/user.model";
import logger from "./logger";
import { LabRoles, WorkspaceRoles } from "../constants";

export const runMigration = async (): Promise<void> => {
  try {
    logger.info("⚡ Starting Research Collab database schema migration...");

    // 1. Find workspaces that do not have a labId set
    const legacyWorkspaces = await Workspace.find({
      $or: [{ labId: { $exists: false } }, { labId: null }],
    });

    if (legacyWorkspaces.length === 0) {
      logger.info("✅ Database is up to date. No legacy workspaces found.");
      return;
    }

    logger.info(`🔍 Found ${legacyWorkspaces.length} legacy workspaces. Processing...`);

    for (const ws of legacyWorkspaces) {
      // Find owner's user details to name the lab
      const ownerId = (ws as any).owner || ws.ownerId;
      if (!ownerId) {
        logger.warn(`⚠️ Skipping legacy workspace "${ws.name}" (${ws._id}) because it has no owner.`);
        continue;
      }

      const ownerUser = await User.findById(ownerId);
      const ownerName = ownerUser ? ownerUser.name : "Principal Investigator";

      // 2. Create a default Lab for this workspace owner if one doesn't exist
      let lab = await Lab.findOne({ ownerId, name: `${ownerName}'s Laboratory` });
      if (!lab) {
        lab = await Lab.create({
          name: `${ownerName}'s Laboratory`,
          description: "Default lab container created during system upgrade.",
          ownerId,
          institution: "Research Institution",
        });

        // Add owner as Lab Owner
        await LabMember.create({
          labId: lab._id,
          userId: ownerId,
          role: LabRoles.OWNER,
        });

        logger.info(`🏛 Created default lab "${lab.name}" for User ${ownerName}`);
      }

      // Update workspace with new fields
      ws.labId = lab._id;
      ws.ownerId = ownerId;
      ws.type = "paper";
      ws.status = "active";
      await ws.save();

      // 3. Pre-create the 3 default pipeline stages for this workspace if not already present
      let upcoming = await PipelineStage.findOne({ workspaceId: ws._id, name: "Upcoming Milestones" });
      let active = await PipelineStage.findOne({ workspaceId: ws._id, name: "Active Research" });
      let completed = await PipelineStage.findOne({ workspaceId: ws._id, name: "Completed & Approved" });

      if (!upcoming) {
        upcoming = await PipelineStage.create({
          workspaceId: ws._id,
          name: "Upcoming Milestones",
          color: "#8e8e93",
          order: 0,
          isDefault: true,
        });
      }
      if (!active) {
        active = await PipelineStage.create({
          workspaceId: ws._id,
          name: "Active Research",
          color: "#0066cc",
          order: 1,
          isDefault: false,
        });
      }
      if (!completed) {
        completed = await PipelineStage.create({
          workspaceId: ws._id,
          name: "Completed & Approved",
          color: "#34c759",
          order: 2,
          isDefault: false,
        });
      }

      logger.info(`🪜 Seeded custom pipeline stages for workspace "${ws.name}"`);

      // 4. Map legacy members to LabMembers
      const workspaceMembers = await Member.find({ workspaceId: ws._id });
      for (const wm of workspaceMembers) {
        const isOwner = wm.role === WorkspaceRoles.OWNER;
        const targetLabRole = isOwner ? LabRoles.OWNER : LabRoles.RESEARCHER;

        // Add to Lab if not already member
        const exists = await LabMember.findOne({ labId: lab._id, userId: wm.userId });
        if (!exists) {
          await LabMember.create({
            labId: lab._id,
            userId: wm.userId,
            role: targetLabRole,
          });
        }
      }

      // 5. Map tasks with status -> stageId
      const legacyTasks = await Task.find({
        workspaceId: ws._id,
        $or: [{ stageId: { $exists: false } }, { stageId: null }],
      });

      logger.info(`📋 Mapping ${legacyTasks.length} tasks in "${ws.name}" to stages...`);

      for (const t of legacyTasks) {
        const oldStatus = (t as any).status || "todo";
        let targetStageId = upcoming._id;

        if (oldStatus === "in-progress") {
          targetStageId = active._id;
        } else if (oldStatus === "done") {
          targetStageId = completed._id;
        }

        t.stageId = targetStageId;
        
        // Handle assignee compatibility (map single assigneeId -> assigneeIds array)
        const oldAssignee = (t as any).assigneeId;
        if (oldAssignee && (!t.assigneeIds || t.assigneeIds.length === 0)) {
          t.assigneeIds = [oldAssignee];
        }

        t.type = "task";
        await t.save();
      }
    }

    logger.info("✅ Database schema migration completed successfully!");
  } catch (error) {
    logger.error("❌ Database schema migration failed:", error);
  }
};
