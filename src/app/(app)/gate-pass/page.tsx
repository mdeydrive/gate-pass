

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
import { QrCode, PlusCircle, Camera, Check, X, AlertTriangle, Calendar as CalendarIcon, ShieldCheck, Search, Ban, Clock, ChevronsUpDown, UserPlus } from "lucide-react";
import type { Activity } from "@/lib/data";
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
import { useRef, useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { format, endOfDay } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { useGatePass } from "@/contexts/gate-pass-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useRole } from "@/contexts/role-context";
import type { ApprovingAuthority } from "@/lib/data";
import { complexes as allComplexes } from "@/lib/data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/auth-context";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

type NewVisitor = {
    visitorName: string;
    mobileNumber: string;
    companyName: string;
    location: string;
}

function AddVisitorDialog({ onAddVisitor, existingVisitors }: { onAddVisitor: (visitor: NewVisitor) => void, existingVisitors: Activity[] }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const titleCasedValue = value
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    setName(titleCasedValue);
  };

  const handleSubmit = () => {
    if (!name || !mobile) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please enter at least a name and mobile number.",
      });
      return;
    }

    const isDuplicate = existingVisitors.some(visitor => visitor.mobileNumber === mobile);
    if (isDuplicate) {
        toast({
            variant: "destructive",
            title: "Duplicate Visitor",
            description: "A visitor with this mobile number already exists.",
        });
        return;
    }

    onAddVisitor({ visitorName: name, mobileNumber: mobile, companyName: company, location: location });
    setOpen(false);
    // Reset form
    setName('');
    setMobile('');
    setCompany('');
    setLocation('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="mr-2 h-4 w-4" /> Add New Visitor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Visitor</DialogTitle>
          <DialogDescription>
            Enter the details for the new visitor.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new-visitor-name" className="text-right">Name</Label>
            <Input id="new-visitor-name" placeholder="Enter full name" className="col-span-3" value={name} onChange={handleNameChange} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new-visitor-mobile" className="text-right">Mobile No.</Label>
            <Input id="new-visitor-mobile" placeholder="Enter 10-digit mobile" className="col-span-3" value={mobile} onChange={(e) => setMobile(e.target.value)} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new-visitor-company" className="text-right">Company</Label>
            <Input id="new-visitor-company" placeholder="Enter company name" className="col-span-3" value={company} onChange={(e) => setCompany(e.target.value.toUpperCase())} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new-visitor-location" className="text-right">Location</Label>
            <Input id="new-visitor-location" placeholder="Enter city or location" className="col-span-3" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleSubmit}>Add Visitor</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


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

function PassForm({ onGeneratePass, authorities }: { onGeneratePass: (newPass: Omit<Activity, 'id' | 'time' | 'date' | 'status' | 'approverIds'>) => void, authorities: ApprovingAuthority[] }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const photoRef = useRef<HTMLCanvasElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const { toast } = useToast();
    const { activities } = useGatePass();

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
    const [selectedVisitorForDisplay, setSelectedVisitorForDisplay] = useState<string>('');
    const [visitingLocation, setVisitingLocation] = useState('');
    const [purposeOfVisit, setPurposeOfVisit] = useState('');


    // Combobox state
    const [comboboxOpen, setComboboxOpen] = useState(false);
    
    const uniqueVisitors = useMemo(() => {
        const visitorsMap = new Map<string, Activity>();
        activities.forEach(activity => {
            const key = `${activity.visitorName}-${activity.mobileNumber}`;
            if (!visitorsMap.has(key)) {
                visitorsMap.set(key, activity);
            }
        });
        return Array.from(visitorsMap.values());
    }, [activities]);

    const resetForm = () => {
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
        setSelectedVisitorForDisplay('');
        setVisitingLocation('');
        setPurposeOfVisit('');
    }

    const prefillVisitorData = (visitor: Activity | NewVisitor) => {
        setVisitorName(visitor.visitorName);
        setMobileNumber(visitor.mobileNumber || '');
        setCompanyName(visitor.companyName || '');
        setLocation(visitor.location || '');
        setSelectedVisitorForDisplay(`${visitor.visitorName} - ${visitor.mobileNumber}`);
        toast({
            title: "Visitor Selected",
            description: `Details for ${visitor.visitorName} have been pre-filled.`,
        });
        setComboboxOpen(false);
    }
    

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

        const newPass = {
            visitorName,
            mobileNumber,
            companyName,
            location,
            passType: passType as Activity['passType'],
            vehicle: vehicleNumber || undefined,
            photo: capturedImage || undefined,
            visitingLocation,
            purposeOfVisit,
        };

        onGeneratePass(newPass);
        resetForm();

        toast({
            title: "Pass Generated!",
            description: `A new gate pass for ${visitorName} has been created and is awaiting approver assignment.`,
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
      
    const isPrefilled = !!selectedVisitorForDisplay;

    return (
        <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 grid gap-4">
                    <div className="grid gap-2">
                        <Label>Search Existing Visitor</Label>
                        <div className="flex gap-2">
                            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={comboboxOpen}
                                    className="w-full justify-between"
                                    >
                                    {selectedVisitorForDisplay
                                        ? selectedVisitorForDisplay
                                        : "Select or search visitor..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search visitor by name or mobile..." />
                                        <CommandList>
                                            <CommandEmpty>
                                                 <Button variant="ghost" className="w-full justify-start" onClick={() => {
                                                    resetForm();
                                                    setComboboxOpen(false);
                                                }}>
                                                    No visitor found. Click to add manually.
                                                </Button>
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {uniqueVisitors.map((visitor) => (
                                                    <CommandItem
                                                    key={visitor.id}
                                                    value={`${visitor.visitorName} ${visitor.mobileNumber}`}
                                                    onSelect={(currentValue) => {
                                                        const selected = uniqueVisitors.find(v => `${v.visitorName} ${v.mobileNumber}`.toLowerCase() === currentValue.toLowerCase());
                                                        if (selected) {
                                                           prefillVisitorData(selected);
                                                        }
                                                    }}
                                                    >
                                                    <Check
                                                        className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedVisitorForDisplay === `${visitor.visitorName} - ${visitor.mobileNumber}` ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {visitor.visitorName} ({visitor.mobileNumber})
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                             <AddVisitorDialog onAddVisitor={prefillVisitorData} existingVisitors={uniqueVisitors} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="visitor-name">Visitor Name</Label>
                            <Input id="visitor-name" placeholder="Enter visitor's full name" value={visitorName} onChange={e => setVisitorName(e.target.value)} readOnly={isPrefilled} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="mobile-number">Mobile Number</Label>
                            <Input id="mobile-number" placeholder="Enter 10-digit mobile number" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} readOnly={isPrefilled} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="grid gap-2">
                            <Label htmlFor="company-name">Company Name (Optional)</Label>
                            <Input id="company-name" placeholder="Enter company name" value={companyName} onChange={e => setCompanyName(e.target.value)} readOnly={isPrefilled} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="location">Location (Optional)</Label>
                            <Input id="location" placeholder="Enter visitor's city or location" value={location} onChange={e => setLocation(e.target.value)} readOnly={isPrefilled} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="visiting-location">Where to go</Label>
                            <Select value={visitingLocation} onValueChange={setVisitingLocation}>
                                <SelectTrigger id="visiting-location">
                                    <SelectValue placeholder="Select location" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allComplexes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="purpose-of-visit">Who to meet</Label>
                             <Select value={purposeOfVisit} onValueChange={setPurposeOfVisit}>
                                <SelectTrigger id="purpose-of-visit">
                                    <SelectValue placeholder="Select person" />
                                </SelectTrigger>
                                <SelectContent>
                                     {authorities.map(a => <SelectItem key={a.id} value={a.name}>{a.name} ({a.role})</SelectItem>)}
                                </SelectContent>
                            </Select>
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
                        <Input id="vehicle-number" placeholder="Enter vehicle registration number" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} />
                    </div>
                    
                    <div className="grid gap-4 pt-4">
                        <Label>Visitor Photo (Optional)</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="w-full aspect-video rounded-md border border-dashed flex items-center justify-center bg-muted overflow-hidden relative">
                               {hasCameraPermission ? (
                                 <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                               ): (
                                <div className="text-center p-4">
                                    <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {hasCameraPermission === null ? "Requesting camera..." : "Camera not available."}
                                    </p>
                                </div>
                               )}
                               <canvas ref={photoRef} className="hidden" />
                            </div>
                             <div className="w-full aspect-video rounded-md border border-dashed flex items-center justify-center bg-muted overflow-hidden">
                                {capturedImage ? (
                                    <img src={capturedImage} alt="Captured" className="object-cover w-full h-full" />
                                ) : (
                                    <p className="text-sm text-muted-foreground">Photo Preview</p>
                                )}
                            </div>
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
                         <div className="flex gap-2">
                            <Button variant="outline" onClick={takePicture} disabled={!hasCameraPermission}>
                                <Camera className="mr-2 h-4 w-4" />
                                {capturedImage ? 'Retake Photo' : 'Take Photo'}
                            </Button>
                            <Input id="id-upload" type="file" accept="image/*" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"/>
                        </div>
                    </div>
                    <Button onClick={handleGeneratePass} className="w-full sm:w-auto justify-self-start">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Generate Gate Pass
                    </Button>
                </div>
            </div>
        </div>
    );
}

function ActivePassesList({ passes, onUpdatePass, onAssignApprover, loading }: { passes: Activity[], onUpdatePass: (id: string, status: Activity['status']) => void, onAssignApprover: (id: string, approverId: string) => void, loading: boolean }) {
    const { role } = useRole();
    const { user } = useAuth();
    
    const [authorities, setAuthorities] = useState<ApprovingAuthority[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchAuthorities() {
            try {
                const response = await fetch('/api/authorities');
                if (!response.ok) throw new Error("Failed to fetch authorities.");
                const data = await response.json();
                setAuthorities(data);
            } catch (error) {
                console.error(error);
                toast({ variant: 'destructive', title: "Error", description: "Could not fetch approving authorities." });
            }
        }
        fetchAuthorities();
    }, [toast]);

    const passesToDisplay = useMemo(() => {
        if (!user) return [];
        if (role === 'Approver') {
            return passes.filter(p => p.approverIds?.includes(user.id) || p.status === 'Pending' && (!p.approverIds || p.approverIds.length === 0));
        }
        if (role === 'Manager') {
             return passes.filter(p => 
                (p.status === 'Pending' && (!p.approverIds || p.approverIds.length === 0)) || 
                (p.approverIds && p.approverIds.includes(user.id))
            );
        }
        if (role === 'Resident') {
            return passes.filter(p => p.requesterId === user.id);
        }
        return passes;
    }, [passes, role, user]);

    const activePasses = passesToDisplay.filter(a => a.status === 'Checked In' || a.status === 'Pending' || a.status === 'Approved');


    const getBadgeVariant = (status: Activity['status']) => {
        switch (status) {
          case 'Checked In': return 'default';
          case 'Checked Out': return 'secondary';
          case 'Pending': return 'destructive';
          case 'Approved': return 'secondary';
          case 'Rejected': return 'destructive';
          default: return 'outline';
        }
    };

    const getApproverName = (approverId: string) => {
        return authorities.find(a => a.id === approverId)?.name || "N/A";
    }

    const isCurrentUserApprover = (approverIds?: string[]) => {
        if (!user || !approverIds || approverIds.length === 0) return false;
        return approverIds.includes(user.id);
    }

    const formatTimestamp = (timestamp?: string) => {
        if (!timestamp) return '';
        try {
            return format(new Date(timestamp), 'PPpp');
        } catch (e) {
            return timestamp;
        }
    }
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active & Pending Passes</CardTitle>
          <CardDescription>
            Visitors currently inside or waiting for entry.
          </CardDescription>
        </CardHeader>
        <CardContent>
        {loading ? (
            <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visitor ID</TableHead>
                <TableHead>Visitor</TableHead>
                <TableHead>Mobile No.</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Pass Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activePasses.length > 0 ? activePasses.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-mono text-xs">{activity.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={activity.photo || `https://avatar.vercel.sh/${activity.visitorName}.png`} />
                        <AvatarFallback>{activity.visitorName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{activity.visitorName}</div>
                        <div className="text-sm text-muted-foreground">
                            {activity.status === 'Pending' && activity.approverIds && activity.approverIds.length > 0 && `Waiting for: ${getApproverName(activity.approverIds[0])}`}
                            {activity.status === 'Approved' && activity.approvedAt && `Approved: ${formatTimestamp(activity.approvedAt)}`}
                            {activity.status === 'Checked In' && activity.checkedInAt && `Checked In: ${formatTimestamp(activity.checkedInAt)}`}
                            {activity.status === 'Pending' && (!activity.approverIds || activity.approverIds.length === 0) && `Requested: ${activity.time}`}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{activity.mobileNumber}</TableCell>
                  <TableCell>{activity.companyName || 'N/A'}</TableCell>
                  <TableCell>{activity.passType}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(activity.status)}>{activity.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 items-center">
                      {activity.status === 'Pending' && (
                        <>
                          {(!activity.approverIds || activity.approverIds.length === 0) && (role === 'Admin' || role === 'Manager') ? (
                            <Select onValueChange={(approverId) => onAssignApprover(activity.id, approverId)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Assign Approver" />
                                </SelectTrigger>
                                <SelectContent>
                                    {authorities.map(auth => (
                                        <SelectItem key={auth.id} value={auth.id}>{auth.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                          ) : isCurrentUserApprover(activity.approverIds) && role === 'Approver' ? (
                            <>
                              <Button variant="outline" size="sm" onClick={() => onUpdatePass(activity.id, 'Approved')}>
                                  <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                                  Approve
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => onUpdatePass(activity.id, 'Rejected')}>
                                  <Ban className="mr-1 h-3.5 w-3.5" />
                                  Reject
                              </Button>
                            </>
                          ) : activity.approverIds && activity.approverIds.length > 0 && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>Waiting for approval</span>
                            </div>
                          )}
                        </>
                      )}
                      {activity.status === 'Approved' && role === 'Security' && (
                        <Button variant="outline" size="sm" onClick={() => onUpdatePass(activity.id, 'Checked In')}>
                            <Check className="mr-1 h-3.5 w-3.5" />
                            Check In
                        </Button>
                      )}
                      {activity.status === 'Checked In' && role === 'Security' && (
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
                    <TableCell colSpan={7} className="text-center">No active passes found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
        </CardContent>
      </Card>
    );
  }

function PreApproveDialog({ activities, onPreApprove }: { activities: Activity[], onPreApprove: (newPass: Omit<Activity, 'id' | 'time' | 'date' | 'status' | 'approverIds'>) => void }) {
    const [open, setOpen] = useState(false);
    const [visitorName, setVisitorName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [passType, setPassType] = useState('');
    const { toast } = useToast();
    const [companyComboboxOpen, setCompanyComboboxOpen] = useState(false);

    // Visitor search state
    const [visitorComboboxOpen, setVisitorComboboxOpen] = useState(false);
    const [selectedVisitorForDisplay, setSelectedVisitorForDisplay] = useState('');

    const uniqueVisitors = useMemo(() => {
        const visitorsMap = new Map<string, Activity>();
        activities.forEach(activity => {
            const key = `${activity.visitorName}-${activity.mobileNumber}`;
            if (!visitorsMap.has(key)) {
                visitorsMap.set(key, activity);
            }
        });
        return Array.from(visitorsMap.values());
    }, [activities]);

    const uniqueCompanies = useMemo(() => {
        const companyNames = new Set<string>();
        activities.forEach(activity => {
            if (activity.companyName) {
                companyNames.add(activity.companyName);
            }
        });
        return Array.from(companyNames);
    }, [activities]);

    const resetForm = () => {
        setVisitorName('');
        setMobileNumber('');
        setCompanyName('');
        setPassType('');
        setSelectedVisitorForDisplay('');
    };

    const prefillVisitorData = (visitor: Activity) => {
        setVisitorName(visitor.visitorName);
        setMobileNumber(visitor.mobileNumber || '');
        setCompanyName(visitor.companyName || '');
        setSelectedVisitorForDisplay(`${visitor.visitorName} - ${visitor.mobileNumber}`);
        setVisitorComboboxOpen(false);
    };

    const handlePreApprove = () => {
        if (!visitorName || !passType || !mobileNumber) {
            toast({
                variant: "destructive",
                title: "Required fields missing",
                description: "Please enter visitor name, mobile number, and select a pass type.",
            });
            return;
        }

        const newPass = {
            visitorName,
            mobileNumber,
            passType: passType as Activity['passType'],
            companyName: companyName,
            location: '', // Optional, can be added
        };

        onPreApprove(newPass);

        toast({
            title: "Pass Pre-approved!",
            description: `A pre-approved pass for ${visitorName} has been created.`,
        });
        
        // Reset form and close dialog
        resetForm();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
                resetForm();
            }
        }}>
            <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1">
                    <PlusCircle className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-rap">Pre-approve</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Create Pre-approved Pass</DialogTitle>
                    <DialogDescription>
                        Search for an existing visitor or enter new details to create a pass that will be active upon arrival.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="pre-visitor-search" className="text-right">Visitor</Label>
                        <div className="col-span-3">
                             <Popover open={visitorComboboxOpen} onOpenChange={setVisitorComboboxOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={visitorComboboxOpen}
                                    className="w-full justify-between font-normal"
                                    >
                                    {selectedVisitorForDisplay
                                        ? selectedVisitorForDisplay
                                        : "Select or search visitor..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search visitor by name or mobile..." />
                                        <CommandList>
                                            <CommandEmpty>No visitor found. Enter details manually.</CommandEmpty>
                                            <CommandGroup>
                                                {uniqueVisitors.map((visitor) => (
                                                    <CommandItem
                                                    key={visitor.id}
                                                    value={`${visitor.visitorName} ${visitor.mobileNumber}`}
                                                    onSelect={() => {
                                                        prefillVisitorData(visitor);
                                                    }}
                                                    >
                                                    <Check
                                                        className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedVisitorForDisplay === `${visitor.visitorName} - ${visitor.mobileNumber}` ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {visitor.visitorName} ({visitor.mobileNumber})
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="pre-visitor-name" className="text-right">Visitor Name</Label>
                        <Input id="pre-visitor-name" placeholder="Enter visitor's full name" className="col-span-3" value={visitorName} onChange={e => setVisitorName(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="pre-mobile-number" className="text-right">Mobile Number</Label>
                        <Input id="pre-mobile-number" placeholder="Enter 10-digit mobile number" className="col-span-3" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                         <Label htmlFor="pre-company-name" className="text-right">Company</Label>
                         <Popover open={companyComboboxOpen} onOpenChange={setCompanyComboboxOpen}>
                            <PopoverTrigger asChild>
                                <div className="col-span-3">
                                    <Input 
                                        id="pre-company-name"
                                        placeholder="Search or enter company name"
                                        value={companyName}
                                        onFocus={() => setCompanyComboboxOpen(true)}
                                        onChange={(e) => {
                                            setCompanyName(e.target.value)
                                            if(!companyComboboxOpen) setCompanyComboboxOpen(true)
                                        }}
                                    />
                                </div>
                            </PopoverTrigger>
                             <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                 <Command>
                                     <CommandInput placeholder="Search company..." />
                                     <CommandList>
                                         <CommandEmpty>No company found. This will be a new entry.</CommandEmpty>
                                         <CommandGroup>
                                             {uniqueCompanies.filter(c => c.toLowerCase().includes(companyName.toLowerCase())).map((company) => (
                                                 <CommandItem
                                                     key={company}
                                                     value={company}
                                                     onSelect={(currentValue) => {
                                                         setCompanyName(currentValue === companyName ? "" : currentValue);
                                                         setCompanyComboboxOpen(false);
                                                     }}
                                                 >
                                                     <Check
                                                         className={cn(
                                                             "mr-2 h-4 w-4",
                                                             companyName.toLowerCase() === company.toLowerCase() ? "opacity-100" : "opacity-0"
                                                         )}
                                                     />
                                                     {company}
                                                 </CommandItem>
                                             ))}
                                         </CommandGroup>
                                     </CommandList>
                                 </Command>
                             </PopoverContent>
                         </Popover>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="pre-pass-type" className="text-right">Pass Type</Label>
                        <Select value={passType} onValueChange={setPassType}>
                            <SelectTrigger id="pre-pass-type" className="col-span-3">
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
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handlePreApprove}>Create Pre-approved Pass</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function PreApprovedList({ passes, loading }: { passes: Activity[], loading: boolean }) {
    const preApprovedPasses = passes.filter(p => p.status === 'Approved');

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pre-approved Visitors</CardTitle>
                <CardDescription>
                    List of visitors pre-approved for entry. Security can check them in upon arrival.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 {loading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Visitor</TableHead>
                                <TableHead>Mobile No.</TableHead>
                                <TableHead>Pass Type</TableHead>
                                <TableHead>Date Approved</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {preApprovedPasses.length > 0 ? preApprovedPasses.map((pass) => (
                                <TableRow key={pass.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={pass.photo || `https://avatar.vercel.sh/${pass.visitorName}.png`} />
                                                <AvatarFallback>{pass.visitorName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{pass.visitorName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{pass.mobileNumber}</TableCell>
                                    <TableCell>{pass.passType}</TableCell>
                                    <TableCell>{pass.date} at {pass.time}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">No pre-approved passes found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}

export default function GatePassPage() {
    const { activities, addActivity, updateActivityStatus, assignApprover, loading, preApproveVisitor } = useGatePass();
    const { role } = useRole();
    const defaultTab = (role === 'Resident' || role === 'Approver') ? 'active' : 'generate';
    const [authorities, setAuthorities] = useState<ApprovingAuthority[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchAuthorities() {
            try {
                const response = await fetch('/api/authorities');
                if (!response.ok) throw new Error("Failed to fetch authorities.");
                const data = await response.json();
                setAuthorities(data);
            } catch (error) {
                console.error(error);
                toast({ variant: 'destructive', title: "Error", description: "Could not fetch staff list." });
            }
        }
        fetchAuthorities();
    }, [toast]);

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="generate">Generate Pass</TabsTrigger>
          <TabsTrigger value="active">Active Passes</TabsTrigger>
          <TabsTrigger value="pre-approved">Pre-approved</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
            
                <Button size="sm" variant="outline" className="h-8 gap-1">
                    <QrCode className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-rap">Scan Pass</span>
                </Button>
            
            <PreApproveDialog activities={activities} onPreApprove={preApproveVisitor} />
        </div>
      </div>
      <TabsContent value="generate">
          <Card>
          <CardHeader>
              <CardTitle>Create New Gate Pass</CardTitle>
              <CardDescription>
              Fill in the details for the new visitor to generate a pass.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <PassForm onGeneratePass={addActivity} authorities={authorities} />
          </CardContent>
          </Card>
      </TabsContent>
      <TabsContent value="active">
        <ActivePassesList passes={activities} onUpdatePass={updateActivityStatus} onAssignApprover={assignApprover} loading={loading} />
      </TabsContent>
      <TabsContent value="pre-approved">
        <PreApprovedList passes={activities} loading={loading} />
      </TabsContent>
    </Tabs>
  );
}
