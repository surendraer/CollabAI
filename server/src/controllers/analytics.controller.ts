import { Request, Response, NextFunction } from "express";
import Member from "../models/member.model";
import Task from "../models/task.model";
import Project from "../models/project.model";
import AppError from "../utils/AppError";
import { HttpStatus, ErrorMessages } from "../constants";

// Simple in-memory cache wrapper to speed up query aggregations without Redis costs
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const getWorkspaceAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const workspaceId = req.params.workspaceId as string;

    // Verify workspace membership
    const membership = await Member.findOne({ workspaceId, userId: req.user!._id });
    if (!membership) {
      throw new AppError(ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    const cacheKey = `analytics:${workspaceId}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      res.status(HttpStatus.OK).json({
        status: "success",
        source: "cache",
        data: cached.data,
      });
      return;
    }

    // 1. Productivity distribution (Task Status counts)
    const taskStatusCounts = await Task.aggregate([
      { $match: { workspaceId: new mongoose.Types.ObjectId(workspaceId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // 2. Team Workload (Task count by assignee)
    const workloadCounts = await Task.aggregate([
      { $match: { workspaceId: new mongoose.Types.ObjectId(workspaceId), status: { $ne: "done" } } },
      { $group: { _id: "$assigneeId", count: { $sum: 1 } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ["$user.name", "Unassigned"] },
          avatar: "$user.avatar",
          count: 1,
        },
      },
    ]);

    // 3. Priority distribution
    const priorityCounts = await Task.aggregate([
      { $match: { workspaceId: new mongoose.Types.ObjectId(workspaceId) } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    // 4. Project-wise Task count
    const projectTaskCounts = await Task.aggregate([
      { $match: { workspaceId: new mongoose.Types.ObjectId(workspaceId) } },
      { $group: { _id: "$projectId", total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] } } } },
      { $lookup: { from: "projects", localField: "_id", foreignField: "_id", as: "project" } },
      { $unwind: "$project" },
      {
        $project: {
          name: "$project.name",
          total: 1,
          completed: 1,
        },
      },
    ]);

    // Aggregate analytics payload
    const analyticsData = {
      taskStatus: taskStatusCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, { todo: 0, "in-progress": 0, done: 0 }),
      workload: workloadCounts,
      priority: priorityCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, { low: 0, medium: 0, high: 0 }),
      projects: projectTaskCounts,
    };

    // Cache the resolved dashboard analytics
    cache.set(cacheKey, {
      data: analyticsData,
      expiry: Date.now() + CACHE_TTL,
    });

    res.status(HttpStatus.OK).json({
      status: "success",
      source: "database",
      data: analyticsData,
    });
  } catch (error) {
    next(error);
  }
};

import mongoose from "mongoose";
