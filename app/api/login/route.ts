import { signJwtAccessToken } from "@/lib/jwt";
import * as bcrypt from "bcrypt";
import connect from "@/lib/db";
import User from "@/lib/modals/user";
import {NextResponse} from "next/server";

interface RequestBody {
    username: string;
    password: string;
}
export async function POST(request: Request) {
    const body: RequestBody = await request.json();
    await connect();
    const user = await User.findOne({username:body.username})
    if(!user){
        return new NextResponse(JSON.stringify({message: "User not found"}), {status:400});
    }
    const {password} = user;

    if (user && (await bcrypt.compare(body.password, password))) {
        const { password, ...userWithoutPass } = user;
        const accessToken = signJwtAccessToken(userWithoutPass);

        const result = {
            password,
            ...userWithoutPass,
            accessToken,
        };
        return new Response(JSON.stringify(result));
    } else
        return new Response(
            JSON.stringify({
                message: "Unathenticated",
            }),
            {
                status: 401,
            }
        );
}