import { NextResponse } from 'next/server';
import { refreshSlotCache } from '@/app/utils/cache';

export async function POST(request) {

    const body = await request.json();
    const { key } = body;

    if (!key || key !== process.env.PERMIT_KEY) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    try {
        if (await refreshSlotCache()) {
            return NextResponse.json({ result: "refresh success!" });
        } else {
            throw "unable to refresh slots";
        }
    } catch (err) {
        return NextResponse.json({ error: err }, { status: 500 });
    }
}