import {getToken} from "next-auth/jwt";
import {NextResponse} from "next/server";

export async function middleware(req){
    //token will be there if user is currently logged in
  const token = await getToken({req, secret: process.env.JWT_SECRET});
  const {pathname} = req.nextUrl;

    //allow the request if the following is true...
    //1) its a request for next-auth session & provider fetching
    //2) if the token exists 
    if (pathname.includes('/api/auth') || token){
        return NextResponse.next();
    }
 
    //redirect them to login if they dont have the token and are requesting for a protected route
    if(!token && pathname !== '/login'){
        return NextResponse.redirect('/login');
    }


}