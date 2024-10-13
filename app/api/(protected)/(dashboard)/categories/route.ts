import {NextResponse} from "next/server";
import connect from "@/lib/db";
import User from "@/lib/modals/user";
import Category from "@/lib/modals/category";
import {Types} from "mongoose";
import {verifyJwt} from "@/lib/jwt";

export const GET = async (request: Request) => {
    try {
        const accessToken:string|null = request.headers.get("Authorization");
        if(!accessToken){
            return new NextResponse(JSON.stringify({message:"unauthorized"}), {status:400});
        } else if(!verifyJwt(accessToken)){
            return new NextResponse(JSON.stringify({message:"unauthorized"}), {status:400});
        }
        const {searchParams} = new URL(request.url);
        const userId = searchParams.get("userId");

        if(!userId||!Types.ObjectId.isValid(userId)){
            return new NextResponse(JSON.stringify({message: "Invalid userId"}), {status:400});
        }

        await connect();
        const user = await User.findById(userId);
        if(!user){
            return new NextResponse(JSON.stringify({message: "User not found"}), {status:400});
        }
        const categories = await Category.find({user: new Types.ObjectId(userId)});
        return new NextResponse(JSON.stringify(categories), {status:200});
    } catch (error){
        if (error instanceof Error) {
            return new NextResponse("Error in fetching categories "+ error.message, {status:500});
        } else {
            return new NextResponse("Unexpected error", { status: 500 });
        }
    }
};

export const POST = async (request: Request) => {
    try {
        const accessToken:string|null = request.headers.get("Authorization");
        if(!accessToken){
            return new NextResponse(JSON.stringify({message:"unauthorized"}), {status:400});
        } else if(!verifyJwt(accessToken)){
            return new NextResponse(JSON.stringify({message:"unauthorized"}), {status:400});
        }
        const {searchParams} = new URL(request.url);
        const userId = searchParams.get("userId");
        const {title} = await request.json();
        if (!title) {
            return new NextResponse(JSON.stringify({message: "Please fill request"}), {status: 400});
        }

        if(!userId){
            return new NextResponse(JSON.stringify({message: "Please select user"}), {status: 400});
        }

        await connect();

        const user = await User.findById(userId);
        if (!user) {
            return new NextResponse(JSON.stringify({message: "User not found"}), {status: 400});
        }

        const newCategory = new Category({
            title,
            user: new Types.ObjectId(userId)
        });
        await newCategory.save();

        return new NextResponse(JSON.stringify({message: "Category created", category: newCategory}), {status: 200});
    } catch (error) {
        if (error instanceof Error) {
            return new NextResponse("Error create categories " + error.message, {status: 500});
        } else {
            return new NextResponse("Unexpected error", { status: 500 });
        }
    }
};