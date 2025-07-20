import React from "react";
import { Button } from "./button";

export default function AISolutionCard({ icon, title, description, features }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <div className="rounded-3xl bg-[#62656e] shadow-2xl p-10 text-white flex flex-col min-h-[340px]">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <h3 className="text-2xl font-bold">{title}</h3>
      </div>
      <p className="mb-4 text-lg">{description}</p>
      <ul className="mb-6 space-y-2">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white inline-block" />
            {f}
          </li>
        ))}
      </ul>
      <Button className="bg-[#643ae5] text-white mt-auto self-start">Find out more →</Button>
    </div>
  );
} 