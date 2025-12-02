import { type NextRequest } from 'next/server'
// Ensure this points to the correct location!
// If you kept the 'utils' folder in the root:
import { updateSession } from '@/utils/supabase/middleware' 

export async function middleware(request: NextRequest) {
    return await updateSession(request)
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}