import {NextResponse} from "next/server";
import connect from "@/lib/db";
import User from "@/lib/modals/user";
import Category from "@/lib/modals/category";
import Blog from "@/lib/modals/blog";
import {RootFilterQuery, Types} from "mongoose";
import {verifyJwt} from "@/lib/jwt";

interface FilterCriteria{
    user: Types.ObjectId,
    category: Types.ObjectId
}

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
        const categoryId = searchParams.get("categoryId");
        const search = searchParams.get("search") as string;
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const page:number= parseInt(searchParams.get("page")=="0"?"1":searchParams.get("page")||"1");
        const size:number = parseInt(searchParams.get("size")=="0"?"1":searchParams.get("size")||"10");

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

        const filter:RootFilterQuery<FilterCriteria> = {
            user: new Types.ObjectId(userId),
            category: new Types.ObjectId(categoryId)
        };

        if(search){
            filter.$or = [
                {
                    title:{$regex: search, $options:"i"}
                },
                {
                    description:{$regex: search, $options:"i"}
                }
            ];
        }

        if(startDate && endDate){
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if(startDate){
            filter.createdAt = {
                $gte: new Date(startDate)
            };
        } else if(endDate){
            filter.createdAt = {
                $lte: new Date(endDate)
            };
        }

        const skip = (page-1)*size;
        const total = await Blog.find().countDocuments();
        const blogs = await Blog.find(filter)
            .sort({createdAt:"asc"})
            .skip(skip)
            .limit(size);
        return new NextResponse(JSON.stringify({blogs, total:total}), {status:200});
    } catch (error){
        if (error instanceof Error) {
            return new NextResponse("Error in fetching blogs "+ error.message, {status:500});
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
        const categoryId = searchParams.get("categoryId");
        const body = await request.json();
        const {title, description} = body;

        if(!title||!description){
            return new NextResponse(JSON.stringify({message: "Please fill request"}), {status:400});
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

        const blog = new Blog({
            title,
            description,
            user: new Types.ObjectId(userId),
            category: new Types.ObjectId(categoryId)
        })

        await blog.save();
        return new NextResponse(JSON.stringify({message: "Blog created",blog:blog}), {status:200});
    } catch (error){
        if (error instanceof Error) {
            return new NextResponse("Error in create blog "+ error.message, {status:500});
        } else {
            return new NextResponse("Unexpected error", { status: 500 });
        }
    }
};