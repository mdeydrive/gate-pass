import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { QrCode, PlusCircle } from "lucide-react";

function PassForm() {
    return (
        <div className="grid gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="visitor-name">Visitor Name</Label>
                    <Input id="visitor-name" placeholder="e.g. John Doe" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="pass-type">Pass Type</Label>
                    <Select>
                        <SelectTrigger id="pass-type">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="guest">Guest/Family</SelectItem>
                            <SelectItem value="delivery">Delivery</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="vehicle">Vehicle</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="valid-from">Valid From</Label>
                    <Input id="valid-from" type="datetime-local" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="valid-to">Valid To</Label>
                    <Input id="valid-to" type="datetime-local" />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="vehicle-number">Vehicle Number (Optional)</Label>
                <Input id="vehicle-number" placeholder="e.g. MH12AB1234" />
            </div>
            <Button className="w-full sm:w-auto justify-self-start">Generate Pass</Button>
        </div>
    );
}

export default function GatePassPage() {
  return (
    <Tabs defaultValue="generate" className="w-full">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="generate">Generate Pass</TabsTrigger>
          <TabsTrigger value="pre-approved">Pre-Approved List</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-7 gap-1">
                <QrCode className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Scan QR</span>
            </Button>
            <Button size="sm" className="h-7 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Pre-Approval</span>
            </Button>
        </div>
      </div>
      <TabsContent value="generate">
        <Card>
          <CardHeader>
            <CardTitle>Create New Gate Pass</CardTitle>
            <CardDescription>
              Fill in the details to generate a new gate pass for a visitor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PassForm />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="pre-approved">
        <Card>
          <CardHeader>
            <CardTitle>Pre-Approved Visitors</CardTitle>
            <CardDescription>
              List of visitors you have pre-approved for entry.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Pre-approved visitor list will be shown here.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
