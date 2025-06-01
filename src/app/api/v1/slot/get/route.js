import { NextResponse } from 'next/server';
import { getSlotsIfAvailable } from '@/app/utils/cache';
import { isBookingAllowed } from '@/app/utils/calendarUtils';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];
        const requestedDate = new Date(dateStr);

        if (!isBookingAllowed(requestedDate)) {
            return NextResponse.json(
                { error: 'Booking not allowed for this date' },
                { status: 400 }
            );
        }

        const availableSlots = await getSlotsIfAvailable(dateStr);

        if (!availableSlots || availableSlots.length === 0) {
            return NextResponse.json(
                { error: 'Slots not available for this date' },
                { status: 404 }
            );
        }

        return NextResponse.json({ date: dateStr, availableSlots });
    } catch (err) {
        return NextResponse.json({ error: err }, { status: 500 });
    }
}

