"use client";

import type { ReactNode } from "react";
import { Calendar, FileText, Stethoscope } from "lucide-react";
import FeatureCard from "./FeatureCard";

export type IconKey = "Calendar" | "Stethoscope" | "FileText";

export type FeatureItem = {
  title: string;
  description: string;
  icon?: ReactNode | IconKey;
};

export type FeaturesSectionProps = {
  title?: string;
  features?: FeatureItem[];
};

const defaultFeatures: FeatureItem[] = [
  {
    title: "Dat lich truc tuyen",
    description: "Dat lich kham nhanh chong, tien loi 24/7",
    icon: "Calendar",
  },
  {
    title: "Kham benh chuyen khoa",
    description: "Doi ngu bac si giau kinh nghiem, trang thiet bi hien dai",
    icon: "Stethoscope",
  },
  {
    title: "Ho so dien tu",
    description: "Quan ly ho so suc khoe an toan, bao mat",
    icon: "FileText",
  },
];

function renderIcon(icon?: FeatureItem["icon"]) {
  if (!icon) return null;
  if (typeof icon !== "string") return icon;
  switch (icon) {
    case "Calendar":
      return <Calendar className="h-6 w-6" />;
    case "Stethoscope":
      return <Stethoscope className="h-6 w-6" />;
    case "FileText":
      return <FileText className="h-6 w-6" />;
    default:
      return null;
  }
}

export function FeaturesSection({
  title = "Dich vu noi bat",
  features = defaultFeatures,
}: FeaturesSectionProps) {
  return (
    <section className="bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="text-center animate-fade-in-up">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            {title}
          </h2>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={renderIcon(feature.icon)}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
