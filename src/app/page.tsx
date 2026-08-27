import type { Metadata } from "next";

import { TaskLibrary } from "@/components/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/TaskLibrary";

export const metadata: Metadata = {
  title: "Your tests · thumbnails",
  description:
    "Every thumbnail test you run, saved and ready to reopen.",
};

export default function HomePage() {
  return <TaskLibrary />;
}
