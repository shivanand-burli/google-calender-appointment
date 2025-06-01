export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { google } = await import('googleapis');

        if (!global.googleAuthClient) {
            global.googleAuthClient = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET
            );

            global.googleAuthClient.setCredentials({
                refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
            });
        }

        /*
        {
        '2025-06-01': {
            '09:00': { state: 'available' },
            '10:00': { state: 'blocked', endsAt: '11:00' },
            '11:00': { state: 'booked' }
        },
        ...
        }
        */

        if (!global.slotCache) {
            global.slotCache = {
                data: {},          // cache object by date
                lastUpdated: null  // timestamp
            };
        }
    }
}
