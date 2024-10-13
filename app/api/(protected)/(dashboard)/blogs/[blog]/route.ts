import {RootFilterQuery, Types} from "mongoose";
import {NextResponse} from "next/server";
import connect from "@/lib/db";
import User from "@/lib/modals/user";
import Category from "@/lib/modals/category";
import Blog from "@/lib/modals/blog";
import {verifyJwt} from "@/lib/jwt";

interface FilterCriteria{
    user: Types.ObjectId,
    category: Types.ObjectId,
    _id: Types.ObjectId
}

interface Params{
    blog: Types.ObjectId
}

export const GET = async (request: Request, context:{params:Params}) => {
    const blogId = context.params.blog
    try {
        const accessToken:string|null = request.headers.get("Authorization");
        if(!accessToken){
            return new NextResponse(JSON.stringify({message:"unauthorized"}), {status:400});
        } else if(!verifyJwt(accessToken)){
            return new NextResponse(JSON.stringify({message:"unauthorized"}), {status:400});
        }
        const {searchParams} = new URL(request.url);
        const userId = searchParams.get("userId");
        const categoryId = searchParams.get("categoryId");

        if(!blogId||!Types.ObjectId.isValid(blogId)){
            return new NextResponse(JSON.stringify({message: "Invalid blog"}), {status:400});
        }

        if(!userId||!Types.ObjectId.isValid(userId)){
            return new NextResponse(JSON.stringify({message: "Invalid user"}), {status:400});
        }

        if(!categoryId||!Types.ObjectId.isValid(categoryId)){
            return new NextResponse(JSON.stringify({message: "Invalid category"}), {status:400});
        }

        await connect();
        const user = await User.findById(userId);
        if(!user){
            return new NextResponse(JSON.stringify({message: "User not found"}), {status:400});
        }

        const category = await Category.findById(categoryId);
        if(!category){
            return new NextResponse(JSON.stringify({message: "Category not found"}), {status:400});
        }

        const filter:RootFilterQuery<FilterCriteria> = {user: new Types.ObjectId(userId), category: new Types.ObjectId(categoryId), _id:new Types.ObjectId(blogId)}

        const blog = await Blog.findOne(filter);
        return new NextResponse(JSON.stringify(blog), {status:200});
    } catch (error){
        if (error instanceof Error) {
            return new NextResponse("Error in fetching blogs: " + error.message, { status: 500 });
        } else {
            return new NextResponse("Unexpected error", { status: 500 });
        }
    }
};

export const PATCH = async (request: Request, context:{params:Params}) => {
    const blogId = context.params.blog
    try {
        const accessToken:string|null = request.headers.get("Authorization");
        if(!accessToken){
            return new NextResponse(JSON.stringify({message:"unauthorized"}), {status:400});
        } else if(!verifyJwt(accessToken)){
            return new NextResponse(JSON.stringify({message:"unauthorized"}), {status:400});
        }
        const {searchParams} = new URL(request.url);
        const userId = searchParams.get("userId");
        const categoryId = searchParams.get("categoryId");
        const body = await request.json();
        const {title, description} = body;

        if(!title||!description){
            return new NextResponse(JSON.stringify({message: "Please fill request"}), {status:400});
        }

        if(!blogId||!Types.ObjectId.isValid(blogId)){
            return new NextResponse(JSON.stringify({message: "Invalid blog"}), {status:400});
        }

        if(!userId||!Types.ObjectId.isValid(userId)){
            return new NextResponse(JSON.stringify({message: "Invalid user"}), {status:400});
        }

        if(!categoryId||!Types.ObjectId.isValid(categoryId)){
            return new NextResponse(JSON.stringify({message: "Invalid category"}), {status:400});
        }

        await connect();
        const user = await User.findById(userId);
        if(!user){
            return new NextResponse(JSON.stringify({message: "User not found"}), {status:400});
        }

        const category = await Category.findById(categoryId);
        if(!category){
            return new NextResponse(JSON.stringify({message: "Category not found"}), {status:400});
        }

        const blog = await Blog.findOneAndUpdate(
            {user: userId, category:categoryId, _id:blogId},
            {title: title, description:description},
            {new:true}
        )

        if(!blog){
            return new NextResponse(JSON.stringify({message: "Blog not found"}), {status:400});
        }
        return new NextResponse(JSON.stringify({message: "Blog updated",blog:blog}), {status:200});
    } catch (error){
        if (error instanceof Error) {
            return new NextResponse("Error in update blog "+ error.message, {status:500});
        } else {
            return new NextResponse("Unexpected error", { status: 500 });
        }
    }
};

export const DELETE = async (request: Request, context:{params:Params}) => {
    const blogId = context.params.blog
    try {
        const accessToken:string|null = request.headers.get("Authorization");
        if(!accessToken){
            return new NextResponse(JSON.stringify({message:"unauthorized"}), {status:400});
        } else if(!verifyJwt(accessToken)){
            return new NextResponse(JSON.stringify({message:"unauthorized"}), {status:400});
        }
        const {searchParams} = new URL(request.url);
        const userId = searchParams.get("userId");
        const categoryId = searchParams.get("categoryId");

        if(!blogId||!Types.ObjectId.isValid(blogId)){
            return new NextResponse(JSON.stringify({message: "Invalid blog"}), {status:400});
        }

        if(!userId||!Types.ObjectId.isValid(userId)){
            return new NextResponse(JSON.stringify({message: "Invalid user"}), {status:400});
        }

        if(!categoryId||!Types.ObjectId.isValid(categoryId)){
            return new NextResponse(JSON.stringify({message: "Invalid category"}), {status:400});
        }

        await connect();
        const user = await User.findById(userId);
        if(!user){
            return new NextResponse(JSON.stringify({message: "User not found"}), {status:400});
        }

        const category = await Category.findById(categoryId);
        if(!category){
            return new NextResponse(JSON.stringify({message: "Category not found"}), {status:400});
        }

        const blog = await Blog.findOneAndDelete(
            {user: userId, category:categoryId, _id:blogId},
            {new:true}
        )

        if(!blog){
            return new NextResponse(JSON.stringify({message: "Blog not found"}), {status:400});
        }
        return new NextResponse(JSON.stringify({message: "Blog deleted",blog:blog}), {status:200});
    } catch (error){
        if (error instanceof Error) {
            return new NextResponse("Error in delete blog "+ error.message, {status:500});
        } else {
            return new NextResponse("Unexpected error", { status: 500 });
        }
    }
};