import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white">
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm text-indigo-600 shadow-sm">
          <Sparkles className="h-4 w-4" />
          Production-ready short-form pipeline
        </div>
        <h1 className="max-w-3xl text-5xl font-bold leading-tight">
          Build, generate, and ship short-form video series with <span className="text-indigo-600">ShortForge</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          One workspace for channels, series planning, scripted generation, and publishing readiness. Move from idea to polished assets in minutes.
        </p>
        <div className="mt-10 flex gap-4">
          <Button asChild size="lg">
            <Link href="/auth/sign-up">
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/auth/sign-in">Sign in</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
