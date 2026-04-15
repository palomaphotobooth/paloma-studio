"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { seriesSchema, type SeriesInput } from "@/lib/validation/series";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/providers/toast-provider";

export function SeriesForm({ initial, id, channels }: { initial?: SeriesInput; id?: string; channels: Array<{ id: string; name: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const { register, handleSubmit, formState } = useForm<SeriesInput>({
    resolver: zodResolver(seriesSchema),
    defaultValues: initial ?? { name: "", description: "", channelId: channels[0]?.id ?? "" }
  });

  const onSubmit = async (values: SeriesInput) => {
    const url = id ? `/api/series/${id}` : "/api/series";
    const method = id ? "PUT" : "POST";
    const res = await fetch(url, { method, body: JSON.stringify(values) });
    if (!res.ok) {
      toast({ title: "Series save failed", variant: "error" });
      return;
    }

    toast({ title: id ? "Series updated" : "Series created", variant: "success" });
    router.push("/dashboard/series");
    router.refresh();
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label>Channel</Label>
        <select className="h-10 w-full rounded-md border bg-background px-3" {...register("channelId")}>
          {channels.map((channel) => <option key={channel.id} value={channel.id}>{channel.name}</option>)}
        </select>
      </div>
      <div><Label>Name</Label><Input {...register("name")} /></div>
      <div><Label>Description</Label><Textarea {...register("description")} /></div>
      <Button disabled={formState.isSubmitting}>{formState.isSubmitting ? "Saving..." : "Save series"}</Button>
    </form>
  );
}
