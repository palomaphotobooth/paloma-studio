import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function Topbar({ email }: { email: string }) {
  return (
    <div className="flex flex-col gap-2 border-b bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <h1 className="text-lg font-semibold">Creator Dashboard</h1>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <span className="truncate text-sm text-muted-foreground">{email}</span>
        <form action={signOut}>
          <Button variant="outline" size="sm" type="submit">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}
