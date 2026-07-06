// ============================================================
// services/scheduler.service.ts
// Background scheduler running hourly tasks (e.g. searching for
// upcoming task deadlines and sending in-app + email alerts).
// ============================================================
import Task from "../models/task.model";
import NotificationService from "./notification.service";
import logger from "../utils/logger";

export class SchedulerService {
  private static intervalId: NodeJS.Timeout | null = null;

  /**
   * Starts the background scheduler loop.
   * Runs the task check immediately and then once every hour.
   */
  public static start(): void {
    if (this.intervalId) return;

    logger.info("⏱️ Deadline scheduler service started.");

    // Run immediately on start
    this.checkDeadlines().catch((err) => {
      logger.error("❌ Error running initial deadline check:", err);
    });

    // Run every hour (3600000 ms)
    this.intervalId = setInterval(() => {
      this.checkDeadlines().catch((err) => {
        logger.error("❌ Error running deadline check loop:", err);
      });
    }, 60 * 60 * 1000);
  }

  /**
   * Stops the background scheduler loop.
   */
  public static stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info("⏱️ Deadline scheduler service stopped.");
    }
  }

  /**
   * Scans for tasks with reminder times in the past, dispatches
   * notifications (both socket and email), and clears the reminder.
   */
  private static async checkDeadlines(): Promise<void> {
    const now = new Date();

    // Find all tasks where reminderAt is in the past
    const tasksToRemind = await Task.find({
      reminderAt: { $lte: now },
    });

    if (tasksToRemind.length === 0) return;

    logger.info(`⏱️ Found ${tasksToRemind.length} task reminders to dispatch.`);

    for (const task of tasksToRemind) {
      if (task.assigneeIds && task.assigneeIds.length > 0) {
        for (const assigneeId of task.assigneeIds) {
          const hoursLeft = task.dueDate
            ? Math.max(0, Math.round((task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)))
            : 24;

          await NotificationService.notify({
            recipientId: assigneeId.toString(),
            type: "deadline_reminder",
            message: `Milestone Reminder: "${task.title}" is due in ${hoursLeft} hours.`,
            meta: {
              workspaceId: task.workspaceId.toString(),
              taskId: task._id.toString(),
            },
            sendEmailAlert: true, // Send both in-app and email
          });
        }
      }

      // Clear the reminder to prevent double notification
      task.reminderAt = undefined;
      await task.save();
    }
  }
}

export default SchedulerService;
