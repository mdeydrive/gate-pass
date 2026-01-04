
'use client';

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
import { QrCode, PlusCircle, Camera, Check, X, AlertTriangle, Calendar as CalendarIcon } from "lucide-react";
import { type Activity } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRef, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { format, endOfDay } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import initialActivities from '@/data/gate-pass-data.json';


function DateTimePicker({ value, onChange, placeholder, disabled }: { value: Date | undefined, onChange: (date: Date | undefined) => void, placeholder: string, disabled?: boolean }) {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date|undefined>(value);

    useEffect(() => {
        setDate(value);
    }, [value, open]);


    const handleConfirm = () => {
        onChange(date);
        setOpen(false);
    }

    const handleCancel = () => {
        setDate(value);
        setOpen(false);
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP HH:mm") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
          <div className="p-3 border-t border-border space-y-2">
             <Input 
                type="time"
                value={date ? format(date, 'HH:mm') : ''}
                onChange={(e) => {
                    const time = e.target.value;
                    if (!time) return;
                    const [hours, minutes] = time.split(':').map(Number);
                    const newDate = date ? new Date(date) : new Date();
                    newDate.setHours(hours);
                    newDate.setMinutes(minutes);
                    setDate(newDate);
                }}
             />
             <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>Cancel</Button>
                <Button size="sm" onClick={handleConfirm}>OK</Button>
             </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

function PassForm({ onGeneratePass }: { onGeneratePass: (newPass: Activity) => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const photoRef = useRef<HTMLCanvasElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const { toast } = useToast();

    // Form state
    const [visitorName, setVisitorName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [location, setLocation] = useState('');
    const [passType, setPassType] = useState('');
    const [validFrom, setValidFrom] = useState<Date | undefined>();
    const [validTo, setValidTo] = useState<Date | undefined>();
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [isNow, setIsNow] = useState(false);
    const [validityOption, setValidityOption] = useState('today');

    useEffect(() => {
        const getCameraPermission = async () => {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setCameraError("Camera not supported by this browser.");
            setHasCameraPermission(false);
            return;
          }

          try {
            const stream = await navigator.mediaDevices.getUserMedia({video: true});
            setHasCameraPermission(true);
            setCameraError(null);
    
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          } catch (error: any) {
            console.error('Error accessing camera:', error);
            if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                setCameraError("No camera device found. Please connect a camera.");
            } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                setCameraError("Camera access was denied. Please enable camera permissions in your browser settings.");
            } else {
                setCameraError("An unknown error occurred while accessing the camera.");
            }
            setHasCameraPermission(false);
          }
        };
    
        getCameraPermission();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }
      }, []);

    const takePicture = () => {
        if (videoRef.current && photoRef.current) {
            const video = videoRef.current;
            const photo = photoRef.current;
            
            photo.width = video.videoWidth;
            photo.height = video.videoHeight;

            const context = photo.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const imageDataUrl = photo.toDataURL('image/png');
                setCapturedImage(imageDataUrl);
            }
        }
    }

    const handleGeneratePass = () => {
        if (!visitorName || !passType || !mobileNumber) {
            toast({
                variant: "destructive",
                title: "Required fields missing",
                description: "Please enter visitor name, mobile number, and select a pass type.",
            });
            return;
        }

        const newPass: Activity = {
            id: `pass-${Date.now()}`,
            visitorName,
            mobileNumber,
            companyName,
            location,
            passType: passType as Activity['passType'],
            status: 'Checked In',
            time: format(new Date(), "hh:mm a"),
            date: format(new Date(), "yyyy-MM-dd"),
            vehicle: vehicleNumber || undefined,
            photo: capturedImage || undefined,
        };

        onGeneratePass(newPass);

        // Reset form
        setVisitorName('');
        setMobileNumber('');
        setCompanyName('');
        setLocation('');
        setPassType('');
        setValidFrom(undefined);
        setValidTo(undefined);
        setVehicleNumber('');
        setCapturedImage(null);
        setIsNow(false);
        setValidityOption('today');

        toast({
            title: "Pass Generated!",
            description: `A new gate pass for ${visitorName} has been created and checked in.`,
        });
    }

    const handleNowChange = (checked: boolean | 'indeterminate') => {
        const isChecked = !!checked;
        setIsNow(isChecked);
        if (isChecked) {
            setValidFrom(new Date());
        } else {
            setValidFrom(undefined);
        }
    };
    
    useEffect(() => {
        if (validityOption === 'today') {
          setValidTo(endOfDay(new Date()));
        } else {
          setValidTo(undefined);
        }
      }, [validityOption]);

    return (
        <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="visitor-name">Visitor Name</Label>
                            <Input id="visitor-name" placeholder="e.g., John Doe" value={visitorName} onChange={e => setVisitorName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="mobile-number">Mobile Number</Label>
                            <Input id="mobile-number" placeholder="e.g., 9876543210" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="grid gap-2">
                            <Label htmlFor="company-name">Company Name (Optional)</Label>
                            <Input id="company-name" placeholder="e.g., Acme Inc." value={companyName} onChange={e => setCompanyName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="location">Location (Optional)</Label>
                            <Input id="location" placeholder="e.g., New York" value={location} onChange={e => setLocation(e.target.value)} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="pass-type">Pass Type</Label>
                        <Select value={passType} onValueChange={setPassType}>
                            <SelectTrigger id="pass-type">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Guest">Guest/Family</SelectItem>
                                <SelectItem value="Delivery">Delivery</SelectItem>
                                <SelectItem value="Staff">Staff</SelectItem>
                                <SelectItem value="Vehicle">Vehicle</SelectItem>
                                <SelectItem value="Vendor">Vendor</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label>Valid From</Label>
                                <div className="flex items-center gap-2">
                                    <Checkbox id="now-checkbox" checked={isNow} onCheckedChange={handleNowChange} />
                                    <Label htmlFor="now-checkbox" className="text-sm font-normal">Now</Label>
                                </div>
                            </div>
                            <DateTimePicker value={validFrom} onChange={setValidFrom} placeholder="Select start date & time" disabled={isNow} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Valid To</Label>
                            <Select value={validityOption} onValueChange={setValidityOption}>
                                <SelectTrigger>
                                <SelectValue placeholder="Select validity" />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectItem value="today">Valid for today</SelectItem>
                                <SelectItem value="manual">Set date and time manually</SelectItem>
                                </SelectContent>
                            </Select>
                            {validityOption === 'manual' && (
                                <div className="mt-2">
                                    <DateTimePicker value={validTo} onChange={setValidTo} placeholder="Select end date & time" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="vehicle-number">Vehicle Number (Optional)</Label>
                        <Input id="vehicle-number" placeholder="e.g., MH12AB1234" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} />
                    </div>
                </div>

                <div className="grid gap-4">
                     <div className="grid gap-2">
                        <Label>Visitor Photo (Optional)</Label>
                        <div className="w-full aspect-video rounded-md border border-dashed flex items-center justify-center bg-muted overflow-hidden relative">
                           {capturedImage ? (
                                <img src={capturedImage} alt="Captured" className="object-cover w-full h-full" />
                           ) : hasCameraPermission ? (
                             <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                           ): (
                            <div className="text-center p-4">
                                <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {hasCameraPermission === null ? "Requesting camera permission..." : "Camera not available."}
                                </p>
                            </div>
                           )}
                           <canvas ref={photoRef} className="hidden" />
                        </div>
                        {cameraError && (
                             <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Camera Error</AlertTitle>
                                <AlertDescription>
                                    {cameraError}
                                </AlertDescription>
                            </Alert>
                        )}
                         <Button variant="outline" onClick={takePicture} disabled={!hasCameraPermission}>
                            <Camera className="mr-2 h-4 w-4" />
                            {capturedImage ? 'Retake Photo' : 'Take Photo'}
                        </Button>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="id-upload">Upload ID (Optional)</Label>
                        <Input id="id-upload" type="file" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"/>
                    </div>
                </div>
            </div>
            <Button className="w-full sm:w-auto justify-self-start" onClick={handleGeneratePass}>Generate Pass & Check-In</Button>
        </div>
    );
}

function ActivePassesList({ passes, onUpdatePass }: { passes: Activity[], onUpdatePass: (id: string, status: Activity['status']) => void }) {
    const activePasses = passes.filter(a => a.status === 'Checked In' || a.status === 'Pending');
  
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
              {activePasses.length > 0 ? activePasses.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={activity.photo || `https://avatar.vercel.sh/${activity.visitorName}.png`} />
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
                      {activity.status === 'Pending' && (
                        <Button variant="outline" size="sm" onClick={() => onUpdatePass(activity.id, 'Checked In')}>
                            <Check className="mr-1 h-3.5 w-3.5" />
                            Verify
                        </Button>
                      )}
                      {activity.status === 'Checked In' && (
                        <Button variant="destructive" size="sm" onClick={() => onUpdatePass(activity.id, 'Checked Out')}>
                            <X className="mr-1 h-3.5 w-3.5" />
                            Check Out
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center">No active passes found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

export default function GatePassPage() {
  const [activities, setActivities] = useState<Activity[]>(initialActivities as Activity[]);

  const handleGeneratePass = (newPass: Activity) => {
    setActivities(prevActivities => [newPass, ...prevActivities]);
  };

  const handleUpdatePass = (id: string, status: Activity['status']) => {
    setActivities(prevActivities => 
        prevActivities.map(pass => 
            pass.id === id ? { ...pass, status: status, ...(status === 'Checked Out' && { checkoutTime: format(new Date(), "hh:mm a") }) } : pass
        )
    );
  };


  return (
    <Tabs defaultValue="generate" className="w-full">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="generate">Generate Pass</TabsTrigger>
          <TabsTrigger value="active">Active Passes</TabsTrigger>
          <TabsTrigger value="pre-approved">Pre-approved</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 gap-1">
                <QrCode className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Scan Pass</span>
            </Button>
            <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Pre-approve</span>
            </Button>
        </div>
      </div>
      <TabsContent value="generate">
        <Card>
          <CardHeader>
            <CardTitle>Create New Gate Pass</CardTitle>
            <CardDescription>
              Fill in the details for the new visitor to generate their pass.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PassForm onGeneratePass={handleGeneratePass} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="active">
        <ActivePassesList passes={activities} onUpdatePass={handleUpdatePass} />
      </TabsContent>
      <TabsContent value="pre-approved">
        <Card>
          <CardHeader>
            <CardTitle>Pre-approved Visitors</CardTitle>
            <CardDescription>
              List of visitors pre-approved by residents for entry.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">The list of pre-approved visitors will be shown here.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
