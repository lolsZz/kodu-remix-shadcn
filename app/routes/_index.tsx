
import type { MetaFunction } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export const meta: MetaFunction = () => {
  return [
    { title: "Kodu.ai Template" },
    { name: "description", content: "A template by Kodu.ai using Remix, Shadcn UI, and Tailwind CSS" },
  ];
};

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Kodu.ai Template
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            A powerful starter template for your next project
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Remix</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Build better websites with Remix, the full stack web framework.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shadcn UI</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Beautifully designed components built with Radix UI and Tailwind CSS.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tailwind CSS</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                A utility-first CSS framework for rapid UI development.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Ready to get started?
          </h2>
          <Button size="lg">
            Get Started
          </Button>
        </div>

        <footer className="mt-16 text-center text-gray-600 dark:text-gray-400">
          <p>
            This template uses Remix, Shadcn UI, Tailwind CSS, and SQLite database. 
            Created with ❤️ by Kodu.ai
          </p>
        </footer>
      </div>
    </div>
  );
}
