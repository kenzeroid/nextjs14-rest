import {NextResponse} from "next/server";
import connect from "@/lib/db";
import User from "@/lib/modals/user";
import Category from "@/lib/modals/category";
import {Types} from "mongoose";
import {verifyJwt} from "@/lib/jwt";

interface Params{
    category: Types.ObjectId
}

export const PATCH = async (request: Request, context:{params:Params}) => {
    const categoryId = context.params.category;
    try{
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

        if(!userId||!Types.ObjectId.isValid(userId)){
            return new NextResponse(JSON.stringify({message: "Invalid userId"}), {status:400});
        }

        if(!categoryId||!Types.ObjectId.isValid(categoryId)){
            return new NextResponse(JSON.stringify({message: "Invalid categoryId"}), {status:400});
        }

        await connect();
        const user = await User.findById(userId);
        if(!user){
            return new NextResponse(JSON.stringify({message: "User not found"}), {status:400});
        }
        const category = await Category.findOneAndUpdate(
            {_id: new Types.ObjectId(categoryId), user: user},
            {title:title},
            {new:true}
        );

        if(!category){
            return new NextResponse(JSON.stringify({message: "Category not found"}), {status:400});
        }

        return new NextResponse(JSON.stringify({message:"Category updated", category: category}), {status:200});
    } catch (error){
        if (error instanceof Error) {
            return new NextResponse("Error delete categories "+ error.message, {status:500});
        } else {
            return new NextResponse("Unexpected error", { status: 500 });
        }
    }
};

export const DELETE = async (request: Request, context:{params:Params}) => {
    const categoryId = context.params.category;
    try{
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

        if(!categoryId||!Types.ObjectId.isValid(categoryId)){
            return new NextResponse(JSON.stringify({message: "Invalid categoryId"}), {status:400});
        }

        await connect();
        const user = await User.findById(userId);
        if(!user){
            return new NextResponse(JSON.stringify({message: "User not found"}), {status:400});
        }
        const category = await Category.findOneAndDelete(
            {_id:categoryId, user:userId}
        );

        if(!category){
            return new NextResponse(JSON.stringify({message: "Category not found"}), {status:400});
        }

        return new NextResponse(JSON.stringify({message:"Category deleted", category: category}), {status:200});
    } catch (error){
        if (error instanceof Error) {
            return new NextResponse("Error delete categories "+ error.message, {status:500});
        } else {
            return new NextResponse("Unexpected error", { status: 500 });
        }
    }
};