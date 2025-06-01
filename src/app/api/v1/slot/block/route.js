import { NextResponse } from 'next/server';
import { isBookingAllowed } from '@/app/utils/calendarUtils';
import { updateSlotBlocked } from '@/app/utils/cache';


export async function POST(request) {
    try {
        const body = await request.json();
        const { date, timeSlot, email, mobile, name } = body;


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

        if (await updateSlotBlocked(date, timeSlot)) {
            return NextResponse.json({ "result": "blocked success" });
        } else {
            return NextResponse.json({ error: "Failed to block" }, { status: 500 });
        }

    } catch (err) {
        return NextResponse.json({ error: err }, { status: 500 });
    }
}