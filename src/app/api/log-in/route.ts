import bcryptjs from "bcryptjs";
import User from "../models/user-model";
import { connectDB } from "../config/db";
import { setCookie } from "../utils/setCookie";

export async function POST(request: Request) {
  await connectDB();
  const body = await request.json();

  const { email, password } = body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return Response.json(
        { message: "Invalid credentials." },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      return Response.json(
        { message: "Invalid credentials." },
        { status: 400 }
      );
    }

    await setCookie(user._id);

    return Response.json(
      {
        message: "Logged in successfully.",
        user: { ...user.toObject(), password: undefined },
      },
      { status: 200 }
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log("Error logging in", error);
    return Response.json({ message: error.message }, { status: 400 });
  }
}