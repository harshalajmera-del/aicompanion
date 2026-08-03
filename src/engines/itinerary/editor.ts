// ─────────────────────────────────────────────────────────────────────────────
// Itinerary Editor
// Handles partial regeneration and targeted edits without touching accepted days.
// ─────────────────────────────────────────────────────────────────────────────

import type { Itinerary, ItineraryEditRequest, ItineraryDay } from '@/types/itinerary';
import type { TripMemory, UserProfile } from '@/types/memory';
import { generateItinerary } from './generator';
import { generateId, addDaysToDate } from '@/lib/utils';

export interface EditResult {
  itinerary: Itinerary;
  changedDayIds: string[];
  changeDescription: string;
}

export function applyEdit(
  itinerary: Itinerary,
  request: ItineraryEditRequest,
  trip: TripMemory,
  profile: UserProfile,
): EditResult {
  const { type, dayId } = request;
  let changedDayIds: string[] = [];
  let changeDescription = '';

  switch (type) {
    case 'change_destination': {
      // Full regeneration required
      const newItinerary = generateItinerary({ trip, profile, existingItinerary: itinerary });
      return {
        itinerary: newItinerary,
        changedDayIds: newItinerary.days.map(d => d.id),
        changeDescription: `Itinerary regenerated for ${newItinerary.destination}`,
      };
    }

    case 'change_dates': {
      // Re-date all days, preserve content
      const newStartDate = trip.startDate ?? itinerary.startDate;
      const updatedDays: ItineraryDay[] = itinerary.days.map((day, i) => ({
        ...day,
        date: addDaysToDate(newStartDate, i),
        modified: true,
      }));
      changedDayIds = updatedDays.map(d => d.id);
      changeDescription = `Dates updated to start ${newStartDate}`;
      return {
        itinerary: {
          ...itinerary,
          startDate: newStartDate,
          endDate: addDaysToDate(newStartDate, itinerary.durationDays),
          days: updatedDays,
          version: itinerary.version + 1,
        },
        changedDayIds,
        changeDescription,
      };
    }

    case 'change_duration': {
      const newDuration = trip.durationDays ?? itinerary.durationDays;
      if (newDuration > itinerary.durationDays) {
        // Generate only the extra days, starting from where the existing itinerary ends
        const extraCount = newDuration - itinerary.durationDays;
        const extraStartDate = addDaysToDate(itinerary.startDate, itinerary.durationDays);
        const extraDays = generateItinerary({
          trip: { ...trip, startDate: extraStartDate, durationDays: extraCount },
          profile,
        }).days.map((d, i) => ({
          ...d,
          dayNumber: itinerary.durationDays + i + 1,
          date: addDaysToDate(itinerary.startDate, itinerary.durationDays + i),
        }));
        const updatedDays = [...itinerary.days, ...extraDays];
        changedDayIds = extraDays.map(d => d.id);
        changeDescription = `Added ${extraCount} day(s) to the itinerary`;
        return {
          itinerary: {
            ...itinerary,
            durationDays: newDuration,
            endDate: addDaysToDate(itinerary.startDate, newDuration),
            days: updatedDays,
            version: itinerary.version + 1,
          },
          changedDayIds,
          changeDescription,
        };
      } else {
        // Remove last days
        const updatedDays = itinerary.days.slice(0, newDuration);
        changeDescription = `Shortened itinerary to ${newDuration} days`;
        return {
          itinerary: {
            ...itinerary,
            durationDays: newDuration,
            endDate: addDaysToDate(itinerary.startDate, newDuration),
            days: updatedDays,
            version: itinerary.version + 1,
          },
          changedDayIds: [],
          changeDescription,
        };
      }
    }

    case 'replace_day_activity': {
      if (!dayId) return { itinerary, changedDayIds: [], changeDescription: 'No day specified' };
      const newDayData = generateItinerary({ trip, profile }).days[0];
      const updatedDays = itinerary.days.map(day =>
        day.id === dayId
          ? { ...newDayData, id: dayId, dayNumber: day.dayNumber, date: day.date, modified: true }
          : day,
      );
      changedDayIds = [dayId];
      changeDescription = `Day ${itinerary.days.find(d => d.id === dayId)?.dayNumber} activities refreshed`;
      return { itinerary: { ...itinerary, days: updatedDays, version: itinerary.version + 1 }, changedDayIds, changeDescription };
    }

    case 'add_day': {
      const newDay = generateItinerary({ trip, profile }).days[0];
      const insertAfterIdx = dayId
        ? itinerary.days.findIndex(d => d.id === dayId)
        : itinerary.days.length - 1;
      const newDayId = generateId();  // stable id captured before building the array
      const newDayDate = addDaysToDate(itinerary.startDate, insertAfterIdx + 1);
      const updatedDays = [
        ...itinerary.days.slice(0, insertAfterIdx + 1),
        { ...newDay, id: newDayId, dayNumber: insertAfterIdx + 2, date: newDayDate },
        ...itinerary.days.slice(insertAfterIdx + 1).map((d, i) => ({
          ...d,
          dayNumber: d.dayNumber + 1,
          date: addDaysToDate(itinerary.startDate, insertAfterIdx + 2 + i),
        })),
      ];
      changedDayIds = [newDayId];
      changeDescription = `Added a new day to the itinerary`;
      return {
        itinerary: {
          ...itinerary,
          durationDays: itinerary.durationDays + 1,
          endDate: addDaysToDate(itinerary.startDate, itinerary.durationDays + 1),
          days: updatedDays,
          version: itinerary.version + 1,
        },
        changedDayIds,
        changeDescription,
      };
    }

    case 'remove_day': {
      if (!dayId) return { itinerary, changedDayIds: [], changeDescription: 'No day specified' };
      const removedDayNumber = itinerary.days.find(d => d.id === dayId)?.dayNumber ?? 0;
      const updatedDays = itinerary.days
        .filter(d => d.id !== dayId)
        .map((d, i) => ({ ...d, dayNumber: i + 1 }));
      changeDescription = `Day ${removedDayNumber} removed`;
      return {
        itinerary: {
          ...itinerary,
          durationDays: itinerary.durationDays - 1,
          endDate: addDaysToDate(itinerary.startDate, itinerary.durationDays - 1),
          days: updatedDays,
          version: itinerary.version + 1,
        },
        changedDayIds: [],
        changeDescription,
      };
    }

    default:
      return { itinerary, changedDayIds: [], changeDescription: 'No change applied' };
  }
}

// ── Mark day as accepted ────────────────────────────────────────────────────────
export function acceptDay(itinerary: Itinerary, dayId: string): Itinerary {
  return {
    ...itinerary,
    days: itinerary.days.map(d => d.id === dayId ? { ...d, accepted: true } : d),
  };
}

// ── Approve entire itinerary ───────────────────────────────────────────────────
export function approveItinerary(itinerary: Itinerary): Itinerary {
  return {
    ...itinerary,
    approved: true,
    days: itinerary.days.map(d => ({ ...d, accepted: true })),
  };
}
