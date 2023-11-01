import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    const data = await req.json();
    console.log({ data });

    return NextResponse.json({
        data
    })
}

export const GET = async (req: NextRequest) => {
    return NextResponse.json({
        data: "hello"
    })
}