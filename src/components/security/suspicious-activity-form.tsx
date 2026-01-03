"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Bot } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { analyzeActivity, type AnalyzeActivityOutput } from "@/ai/flows/suspicious-activity-alerts";

const formSchema = z.object({
  entryTime: z.string().min(1, "Entry time is required."),
  exitTime: z.string().min(1, "Exit time is required."),
  personnelType: z.enum(['visitor', 'delivery', 'staff', 'vehicle']),
  personnelId: z.string().min(1, "Personnel ID is required."),
  isBlacklisted: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function SuspiciousActivityForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeActivityOutput | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entryTime: new Date(new Date().getTime() - 60 * 60 * 1000).toISOString().substring(0, 16),
      exitTime: new Date().toISOString().substring(0, 16),
      personnelType: "visitor",
      personnelId: "V-12345",
      isBlacklisted: false,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    setResult(null);
    try {
      const analysisResult = await analyzeActivity({
        ...data,
        entryTime: new Date(data.entryTime).toISOString(),
        exitTime: new Date(data.exitTime).toISOString(),
      });
      setResult(analysisResult);
    } catch (error) {
      console.error("Analysis failed:", error);
      setResult({
        isSuspicious: true,
        reason: "An error occurred during analysis. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot />
          AI-Powered Suspicious Activity Detection
        </CardTitle>
        <CardDescription>
          Enter entry/exit details to analyze for suspicious patterns. The AI will flag anomalies.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
                <FormField
                control={form.control}
                name="entryTime"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Entry Time</FormLabel>
                    <FormControl>
                        <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="exitTime"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Exit Time</FormLabel>
                    <FormControl>
                        <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="personnelType"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Personnel Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="visitor">Visitor</SelectItem>
                            <SelectItem value="delivery">Delivery</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="vehicle">Vehicle</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="personnelId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Personnel ID</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g. V-12345 or DL-9C-AB-1234" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <FormField
              control={form.control}
              name="isBlacklisted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Personnel is on the blacklist
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Analyzing..." : "Analyze Activity"}
            </Button>
          </form>
        </Form>
        {result && (
            <Alert variant={result.isSuspicious ? "destructive" : "default"} className="mt-8">
                {result.isSuspicious ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                <AlertTitle>{result.isSuspicious ? 'Suspicious Activity Detected' : 'No Suspicious Activity Detected'}</AlertTitle>
                <AlertDescription>
                    {result.reason || 'The activity appears to be normal.'}
                </AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}
