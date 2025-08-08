import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
    const { sessionClaims } = await auth();
    
  if (sessionClaims?.metadata?.role === "admin") {
    redirect("/admin");
  }

  return (
    <div className='flex justify-center mt-12'>
      <SignIn />
    </div>
  );
}
