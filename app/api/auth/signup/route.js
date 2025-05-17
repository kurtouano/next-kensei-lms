import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { name, email, password } = await req.json();
        const hashedPassword = 
        console.log("Received data:", { name, email, password });
        
        return NextResponse.json({ message: "User is Registered" }, { status: 201 });

    } catch (error) {
        console.error("Error in POST request:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
