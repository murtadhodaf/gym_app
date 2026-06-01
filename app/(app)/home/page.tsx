import { currentUser } from "@clerk/nextjs/server";

export default async function HomePage() {
  const user = await currentUser();
  return (
    <main className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-[30px] font-medium tracking-[-0.025em] text-ink">
          Good morning, <em>{user?.firstName ?? "there"}.</em>
        </h1>
        <p className="text-ink-3 text-[14px] mt-2">Phase 0 scaffold — more coming soon.</p>
      </div>
    </main>
  );
}
