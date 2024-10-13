import {NextResponse} from "next/server";
import connect from "@/lib/db";
import User from "@/lib/modals/user";
import {Types} from "mongoose";
import bcrypt from 'bcrypt'
import {verifyJwt} from "@/lib/jwt";

export const GET = async (request:Request) => {
    try {
        const accessToken:string|null = request.headers.get("Authorization");
        if(!accessToken){
            return new NextResponse(JSON.stringify({message:"unauthorized"}), {status:400});
        } else if(!verifyJwt(accessToken)){
            return new NextResponse(JSON.stringify({message:"unauthorized"}), {status:400});
        }
        await connect();
        const users = await User.find();
        return new NextResponse(JSON.stringify(users), {status:200});
    } catch (error){
        if (error instanceof Error) {
            return new NextResponse("Error in fetching user "+ error.message, {status:500});
        } else {
            return new NextResponse("Unexpected error", { status: 500 });
        }
    }
};

export const POST = async (request: Request) => {
    try{
        const accessToken:string|null = request.headers.get("Authorization");
        if(!accessToken){
            return new NextResponse(JSON.stringify({message:"unauthorized"}), {status:400});
        } else if(!verifyJwt(accessToken)){
            return new NextResponse(JSON.stringify({message:"unauthorized"}), {status:400});
        }
        const body = await request.json();
        const hashedPassword = await bcrypt.hash(body.password, 10)

        await connect();
        const newUser = new User({
                username:body.username,
                email:body.email,
                password:hashedPassword
            }
        );
        await newUser.save();

        return new NextResponse(JSON.stringify({message:"User created", user: newUser}), {status:200});
    } catch (error){
        if (error instanceof Error) {
            return new NextResponse("Error create user "+ error.message, {status:500});
        } else {
            return new NextResponse("Unexpected error", { status: 500 });
        }
    }
}

export const PATCH = async (request: Request) =>{
    try {
        const accessToken:string|null = request.headers.get("Authorization");
        if(!accessToken){
            return new NextResponse(JSON.stringify({message:"unauthorized"}), {status:400});
        } else if(!verifyJwt(accessToken)){
            return new NextResponse(JSON.stringify({message:"unauthorized"}), {status:400});
        }
        const body = await request.json();
        const {userId, username} = body;
        if(!userId||!username){
            return new NextResponse(JSON.stringify({message: "Please fill the request"}), {status:400});
        }

        if(!Types.ObjectId.isValid(userId)){
            return new NextResponse(JSON.stringify({message: "Invalid userId"}), {status:400});
        }

        await connect();
        const updatedUser = await User.findOneAndUpdate(
            {_id: new Types.ObjectId(userId)},
            {username: username},
            {new:true}
        );
        if(!updatedUser){
            return new NextResponse(JSON.stringify({message: "User not found"}), {status:400});
        }
        return new NextResponse(JSON.stringify({message: "User is updated", user: updatedUser}), {status:200});
    } catch (error){
        if (error instanceof Error) {
            return new NextResponse("Error update user "+ error.message, {status:500});
        } else {
            return new NextResponse("Unexpected error", { status: 500 });
        }
    }
}

export const DELETE = async (request: Request) => {
    try{
        const accessToken:string|null = request.headers.get("Authorization");
        if(!accessToken){
            return new NextResponse(JSON.stringify({message:"unauthorized"}), {status:400});
        } else if(!verifyJwt(accessToken)){
            return new NextResponse(JSON.stringify({message:"unauthorized"}), {status:400});
        }
        const {searchParams} = new URL(request.url);
        const userId = searchParams.get("userId");

        if(!userId){
            return new NextResponse(JSON.stringify({message: "Please fill the request"}), {status:400});
        }

        if(!Types.ObjectId.isValid(userId)){
            return new NextResponse(JSON.stringify({message: "Invalid userId"}), {status:400});
        }

        await connect();
        const deletedUser = await User.findByIdAndDelete(
            new Types.ObjectId(userId)
        );

        if(!deletedUser){
            return new NextResponse(JSON.stringify({message: "User not found"}), {status:400});
        }
        return new NextResponse(JSON.stringify({message:"User deleted", user: deletedUser}), {status:200});
    } catch (error){
        if (error instanceof Error) {
            return new NextResponse("Error create user "+ error.message, {status:500});
        } else {
            return new NextResponse("Unexpected error", { status: 500 });
        }
    }
}