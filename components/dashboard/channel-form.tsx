"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { channelSchema, type ChannelInput } from "@/lib/validation/channel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/providers/toast-provider";

export function ChannelForm({ initial, id }: { initial?: ChannelInput; id?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { register, handleSubmit, formState } = useForm<ChannelInput>({
    resolver: zodResolver(channelSchema),
    defaultValues: initial ?? { name: "", platform: "", status: "active" }
  });

  const onSubmit = async (values: ChannelInput) => {
    const url = id ? `/api/channels/${id}` : "/api/channels";
    const method = id ? "PUT" : "POST";
    const res = await fetch(url, { method, body: JSON.stringify(values) });

    if (!res.ok) {
      toast({ title: "Channel save failed", variant: "error" });
      return;
    }

    toast({ title: id ? "Channel updated" : "Channel created", variant: "success" });
    router.push("/dashboard/channels");
    router.refresh();
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div><Label>Name</Label><Input {...register("name")} /></div>
      <div><Label>Platform</Label><Input {...register("platform")} /></div>
      <div><Label>Status</Label><select className="h-10 w-full rounded-md border bg-background px-3" {...register("status")}><option value="active">Active</option><option value="paused">Paused</option></select></div>
      <Button disabled={formState.isSubmitting}>{formState.isSubmitting ? "Saving..." : "Save channel"}</Button>
    </form>
  );
}
