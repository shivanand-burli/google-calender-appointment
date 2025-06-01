import { NextResponse } from 'next/server';
import { bookSlot, isBookingAllowed } from '@/app/utils/calendarUtils';
import { updateSlotBooked } from '@/app/utils/cache';


export async function POST(request) {
    try {
        const body = await request.json();
        const { key, date, timeSlot, email, mobile, name } = body;

        if (!key || key !== process.env.PERMIT_KEY) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
        }

        if (!date || !timeSlot) {
            return NextResponse.json({ error: 'Missing date or timeSlot' }, { status: 400 });
        }

        if (!email) {
            return NextResponse.json({ error: 'Missing email' }, { status: 400 });
        }

        if (!isBookingAllowed(new Date(date))) {
            return NextResponse.json(
                { error: 'Booking not allowed for this date' },
                { status: 400 }
            );
        }

        const start = Date.now();
        const result = await bookSlot(date, timeSlot, email, mobile, name);
        const duration = ((Date.now() - start) / 1000).toFixed(2);

        if (result.status === 'success') {
            updateSlotBooked(date, timeSlot);
            return NextResponse.json({ ...result, duration: `${duration}s` });
        } else {
            return NextResponse.json({ error: result?.reason || "Failed to create event" }, { status: 500 });
        }
    } catch (err) {
        return NextResponse.json({ error: err }, { status: 500 });
    }
}