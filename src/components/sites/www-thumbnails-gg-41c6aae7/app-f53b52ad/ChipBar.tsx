"use client";

import { useState } from "react";
import { DESKTOP_CHIPS } from "@/data/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/guideChannels";

/** The sticky filter-chip row above the feed grid. */
export function ChipBar() {
  const [selected, setSelected] = useState("All");

  return (
    <div className="yt-chipbar">
      {DESKTOP_CHIPS.map((chip) => (
        <button
          className="yt-chip"
          data-selected={chip === selected}
          onClick={() => setSelected(chip)}
          tabIndex={-1}
          key={chip}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
