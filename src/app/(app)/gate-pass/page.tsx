
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  
  export default function GatePassPage() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gate Pass</CardTitle>
          <CardDescription>
            This is the Gate Pass page. Functionality has been moved to "Manage Gate Passes".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please use the "Manage Gate Passes" section in the sidebar to create and manage gate passes.</p>
        </CardContent>
      </Card>
    );
  }
  