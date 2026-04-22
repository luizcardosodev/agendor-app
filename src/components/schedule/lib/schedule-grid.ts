export const GRID_START_HOUR = 8;
export const GRID_END_HOUR = 20;
export const HOUR_ROW_HEIGHT = 72;
export const HALF_HOUR_ROW_HEIGHT = HOUR_ROW_HEIGHT / 2;
export const TIME_GUTTER_WIDTH = 88;
export const WEEK_HEADER_HEIGHT = 80;

export function getMinutesFromGridStart(date: Date) {
  return (date.getHours() - GRID_START_HOUR) * 60 + date.getMinutes();
}

export function isWithinScheduleWindow(date: Date) {
  const minutes = getMinutesFromGridStart(date);
  return minutes >= 0 && minutes <= (GRID_END_HOUR - GRID_START_HOUR) * 60;
}

export function getVerticalOffset(date: Date, pixelsPerHour: number) {
  return (getMinutesFromGridStart(date) / 60) * pixelsPerHour;
}
