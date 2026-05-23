export async function POST(req: Request) {

  try {

    const body = await req.json();

    return Response.json({
      success: true,
      message: "Register success",
      user: body,
    });

  } catch (error) {

    console.error(error);

    return Response.json(
      {
        error: "Register failed",
      },
      {
        status: 500,
      }
    );
  }
}