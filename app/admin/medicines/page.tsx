"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pill, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MedicineListPage } from "./_components/MedicineListPage";
import { CategoryListPage } from "./_components/CategoryListPage";

export default function MedicinesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Pill className="h-6 w-6" />
            Medicines Management
          </h1>
          <p className="text-muted-foreground">
            Manage medicine inventory, pricing, and categories.
          </p>
        </div>
      </div>

      <Tabs defaultValue="medicines" className="w-full">
        <TabsList>
          <TabsTrigger value="medicines">Medicines</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="medicines" className="mt-4">
          <MedicineListPage />
        </TabsContent>
        <TabsContent value="categories" className="mt-4">
          <CategoryListPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
