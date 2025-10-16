"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dumbbell,
  Calendar,
  Plus,
  Settings,
  Activity,
  ChevronRight,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();

  const menuItems = [
    {
      title: "Ejercicios",
      description: "Crear y administrar ejercicios",
      icon: Dumbbell,
      href: "/dashboard/ejercicios",
    },
    {
      title: "Rutinas",
      description: "Crear rutinas de entrenamiento",
      icon: Calendar,
      href: "/dashboard/rutinas",
    },

    {
      title: "Gestionar Rutinas",
      description: "Editar rutinas existentes",
      icon: Settings,
      href: "/dashboard/gestionar-rutinas",
    },
    {
      title: "Grupos Musculares",
      description: "Administrar grupos musculares",
      icon: Activity,
      href: "/dashboard/grupos-musculares",
    },
  ];

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      {menuItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className="w-full text-left"
          >
            <Card className="border hover:border-gray-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-base">{item.title}</h3>
                    <p className="text-sm mt-0.5">{item.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
