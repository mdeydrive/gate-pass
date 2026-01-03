'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { QrCode, PlusCircle, Camera, Upload, User, Check, X } from "lucide-react";
import { activities } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRef, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


function PassForm() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const photoRef = useRef<HTMLCanvasElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const getCameraPermission = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({video: true});
            setHasCameraPermission(true);
    
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
              variant: 'destructive',
              title: 'Camera Access Denied',
              description: 'Please enable camera permissions in your browser settings.',
            });
          }
        };
    
        getCameraPermission();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }
      }, [toast]);

    const takePicture = () => {
        if (videoRef.current && photoRef.current) {
            const video = videoRef.current;
            const photo = photoRef.current;
            
            photo.width = video.videoWidth;
            photo.height = video.videoHeight;

            const context = photo.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            setCapturedImage(photo.toDataURL('image/png'));
        }
    }

    return (
        <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-4">
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
                                <SelectItem value="vendor">Vendor</SelectItem>
                            </SelectContent>
                        </Select>
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
                </div>

                <div className="grid gap-4">
                     <div className="grid gap-2">
                        <Label>Visitor Photo (Optional)</Label>
                        <div className="w-full aspect-video rounded-md border border-dashed flex items-center justify-center bg-muted overflow-hidden">
                           {capturedImage ? (
                                <img src={capturedImage} alt="Captured" className="object-cover w-full h-full" />
                           ) : hasCameraPermission ? (
                             <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted />
                           ): (
                            <div className="text-center p-4">
                                <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">Camera not available. Please grant permission.</p>
                            </div>
                           )}
                           <canvas ref={photoRef} style={{display: 'none'}} />
                        </div>
                        <Button variant="outline" onClick={takePicture} disabled={!hasCameraPermission}>
                            <Camera className="mr-2 h-4 w-4" />
                            {capturedImage ? 'Retake Photo' : 'Capture Photo'}
                        </Button>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="id-upload">ID Proof (Optional)</Label>
                        <Input id="id-upload" type="file" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"/>
                    </div>
                </div>
            </div>
            <Button className="w-full sm:w-auto justify-self-start">Generate Pass & Check-In</Button>
        </div>
    );
}

function ActivePassesList() {
    const activePasses = activities.filter(a => a.status === 'Checked In' || a.status === 'Pending').slice(0, 5);
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active & Pending Passes</CardTitle>
          <CardDescription>
            Visitors currently inside or waiting for entry.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visitor</TableHead>
                <TableHead>Pass Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activePasses.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`/placeholders/user${(parseInt(activity.id) % 4) + 1}.jpg`} />
                        <AvatarFallback>{activity.visitorName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{activity.visitorName}</div>
                        <div className="text-sm text-muted-foreground">Checked In: {activity.time}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{activity.passType}</TableCell>
                  <TableCell>
                    <Badge variant={activity.status === 'Checked In' ? 'default' : 'destructive'}>{activity.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Check className="mr-1 h-3.5 w-3.5" />
                        Verify
                      </Button>
                      <Button variant="destructive" size="sm">
                        <X className="mr-1 h-3.5 w-3.5" />
                        Check Out
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

export default function GatePassPage() {
  return (
    <Tabs defaultValue="generate" className="w-full">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="generate">Generate Pass</TabsTrigger>
          <TabsTrigger value="active">Active Passes</TabsTrigger>
          <TabsTrigger value="pre-approved">Pre-Approved</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 gap-1">
                <QrCode className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Scan Pass</span>
            </Button>
            <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Pre-Approve</span>
            </Button>
        </div>
      </div>
      <TabsContent value="generate">
        <Card>
          <CardHeader>
            <CardTitle>Create New Gate Pass</CardTitle>
            <CardDescription>
              Fill in the details for a new visitor and generate their pass.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PassForm />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="active">
        <ActivePassesList />
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
