import { getAvailableSlots } from '@/app/utils/calendarUtils';
import { addDays, format, addMinutes } from 'date-fns';

export const allowedBookingDays = parseInt(process.env.ALLOWED_BOOKING_DAYS || '7', 10);

export const SlotState = Object.freeze({
    AVAILABLE: 'available',
    BOOKED: 'booked',
    BLOCKED: 'blocked',
});


export async function refreshSlotCache() {

    console.log('Refreshing slot cache...');

    const today = new Date();
    const newCache = {};

    for (let i = 0; i < allowedBookingDays; i++) {
        const date = addDays(today, i);
        const dateStr = format(date, 'yyyy-MM-dd');

        const slots = await getAvailableSlots(dateStr); // returns ["11:00", "11:30"]

        const slotMap = {};
        for (const time of slots) {
            if (typeof time === 'string') {
                slotMap[time] = { state: SlotState.AVAILABLE };
            } else {
                console.warn(`Invalid time slot:`, time);
            }
        }

        newCache[dateStr] = slotMap;
    }

    global.slotCache.data = newCache;
    global.slotCache.lastUpdated = new Date();

    return true;
}

export async function updateSlotBooked(dateStr, timeSlot) {
    if (
        global.slotCache &&
        global.slotCache.data &&
        global.slotCache.data[dateStr] &&
        global.slotCache.data[dateStr][timeSlot]
    ) {
        global.slotCache.data[dateStr][timeSlot].state = SlotState.BOOKED;
    }
}

export async function updateSlotBlocked(dateStr, timeSlot) {
    const availableSlots = await getSlotsIfAvailable(dateStr);
    if (!availableSlots.includes(timeSlot)) {
        throw "slot is not available";
    }

    if (
        global.slotCache &&
        global.slotCache.data &&
        global.slotCache.data[dateStr] &&
        global.slotCache.data[dateStr][timeSlot]
    ) {
        // const [hours, minutes] = timeSlot.split(':').map(Number);
        const start = new Date();
        // start.setHours(hours, minutes, 0, 0);

        const end = addMinutes(start, 2);

        global.slotCache.data[dateStr][timeSlot] = {
            state: SlotState.BLOCKED,
            endTime: end.toISOString(), // Optional: format as needed
        };

        return true;
    }

    return false;
}

export async function updateSlotAvailable(dateStr, timeSlot) {
    if (
        global.slotCache &&
        global.slotCache.data &&
        global.slotCache.data[dateStr] &&
        global.slotCache.data[dateStr][timeSlot]
    ) {
        global.slotCache.data[dateStr][timeSlot].state = SlotState.AVAILABLE;
    }
}

export async function isSlotBlocked(dateStr, timeSlot) {
    const slot = global.slotCache?.data?.[dateStr]?.[timeSlot];

    if (!slot) return false;

    if (slot.state === SlotState.BLOCKED) {
        return true;
    }

    return false;
}


export async function getSlotsIfAvailable(dateStr) {
    if (
        !global.slotCache?.data ||
        Object.keys(global.slotCache.data).length === 0 ||
        (dateStr && !global.slotCache.data[dateStr])
    ) {
        await refreshSlotCache();
    }

    const slotCache = global.slotCache?.data;
    const slots = slotCache?.[dateStr];

    if (!slots) {
        return [];
    }

    const now = new Date();
    const requestedDate = new Date(dateStr);
    const isToday = requestedDate.toDateString() === now.toDateString();

    const availableSlots = [];

    for (const [time, value] of Object.entries(slots)) {
        // Restore blocked slot if endTime has passed
        if (value.state === SlotState.BLOCKED && value.endTime) {
            if (value.endTime <= now.toISOString()) {
                value.state = SlotState.AVAILABLE;
                delete value.endTime;
            }
        }

        if (value.state === SlotState.AVAILABLE) {
            if (isToday) {
                const [hours, minutes] = time.split(':').map(Number);
                const slotDate = new Date(requestedDate);
                slotDate.setHours(hours, minutes, 0, 0);

                const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
                if (slotDate <= twoHoursLater) continue;
            }

            availableSlots.push(time);
        }
    }

    return availableSlots;
}

