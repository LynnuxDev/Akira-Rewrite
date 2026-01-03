function startOfTodayUTC(): number {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return Math.floor(now.getTime() / 1000);
}

function startOfYesterdayUTC(): number {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  now.setDate(now.getDate() - 1);
  return Math.floor(now.getTime() / 1000);
}

export { startOfTodayUTC, startOfYesterdayUTC };
