import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to Vibe31
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Your AI-powered marketing command center
        </p>
        <div className="flex justify-center">
          <Button>Get Started</Button>
        </div>
      </div>
    </main>
  );
}