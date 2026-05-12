const Complaint = require('../models/Complaint');

/**
 * Weighted Priority Formula:
 * Priority = (CategoryWeight * 0.7) + (TimeFactor * 0.3)
 *
 * TimeFactor scales from 0 to 10 based on hours elapsed:
 *   0-6 hrs   → 0-2   (new, low urgency)
 *   6-24 hrs  → 2-5   (building urgency)
 *   1-7 days  → 5-8   (significant delay)
 *   7+ days   → 8-10  (critical delay)
 */
const calculateTimeFactor = (createdAt) => {
  const hoursElapsed = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);

  if (hoursElapsed < 6)   return (hoursElapsed / 6) * 2;
  if (hoursElapsed < 24)  return 2 + ((hoursElapsed - 6) / 18) * 3;
  if (hoursElapsed < 168) return 5 + ((hoursElapsed - 24) / 144) * 3;
  return Math.min(10, 8 + ((hoursElapsed - 168) / 168) * 2);
};

const calculatePriority = (category, createdAt) => {
  const categoryWeight = Complaint.CATEGORY_WEIGHTS[category] || 2;
  const timeFactor = calculateTimeFactor(createdAt);
  const score = (categoryWeight * 0.7) + (timeFactor * 0.3);
  return {
    score: parseFloat(score.toFixed(2)),
    categoryWeight,
    timeFactor: parseFloat(timeFactor.toFixed(2)),
    lastCalculated: new Date(),
  };
};

/**
 * Recalculates priority for all unresolved complaints.
 * Called by a scheduled job every hour.
 */
const recalculateAllPriorities = async () => {
  try {
    const openComplaints = await Complaint.find({
      status: { $nin: ['resolved', 'rejected'] },
    });

    const updates = openComplaints.map((complaint) => {
      const priority = calculatePriority(complaint.category, complaint.createdAt);
      return Complaint.findByIdAndUpdate(complaint._id, { priority });
    });

    await Promise.all(updates);
    console.log(`Priority recalculated for ${openComplaints.length} complaints`);
  } catch (error) {
    console.error('Priority recalculation error:', error);
  }
};

module.exports = { calculatePriority, recalculateAllPriorities, calculateTimeFactor };