import { pool } from "../config/database";
import { config } from "../config/validateEnv";

interface CleanupStats {
  deletedCount: number;
  remainingCount: number;
  oldestRemaining: Date | null;
  executionTime: number;
}

async function cleanupSessions(): Promise<CleanupStats> {
  const startTime = Date.now();

  try {
    // Delete expired sessions
    const deleteResult = await pool.query(
      "DELETE FROM session WHERE expire < NOW() RETURNING sid"
    );

    // Get stats about remaining sessions
    const statsResult = await pool.query(
      `SELECT COUNT(*) as count, 
              MIN(expire) as oldest_remaining 
       FROM session`
    );

    const stats: CleanupStats = {
      deletedCount: deleteResult.rowCount ?? 0,
      remainingCount: parseInt(statsResult.rows[0].count) || 0,
      oldestRemaining: statsResult.rows[0].oldest_remaining || null,
      executionTime: Date.now() - startTime,
    };

    // Log cleanup results
    console.log("[Session Cleanup]", {
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      ...stats,
    });

    // Alert if cleanup took too long
    if (stats.executionTime > 5000) {
      // 5 seconds threshold
      console.warn(
        "[Session Cleanup] Warning: Cleanup operation took longer than expected",
        {
          executionTime: stats.executionTime,
          deletedCount: stats.deletedCount,
        }
      );
    }

    // Alert if too many sessions remain
    if (stats.remainingCount > 10000) {
      // Arbitrary threshold, adjust based on your needs
      console.warn(
        "[Session Cleanup] Warning: High number of active sessions",
        {
          remainingCount: stats.remainingCount,
        }
      );
    }

    return stats;
  } catch (error) {
    console.error("[Session Cleanup] Error:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  cleanupSessions()
    .then((stats) => {
      console.log("Session cleanup completed successfully:", stats);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Session cleanup failed:", error);
      process.exit(1);
    });
}

export { cleanupSessions, CleanupStats };
