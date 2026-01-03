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
import { QrCode, PlusCircle, Camera, Check, X } from "lucide-react";
import { activities as initialActivities, type Activity } from "@/lib/data";
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
import { format } from "date-fns";

function PassForm({ onGeneratePass }: { onGeneratePass: (newPass: Activity) => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const photoRef = useRef<HTMLCanvasElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const { toast } = useToast();

    // Form state
    const [visitorName, setVisitorName] = useState('');
    const [passType, setPassType] = useState('');
    const [validFrom, setValidFrom] = useState('');
    const [validTo, setValidTo] = useState('');
    const [vehicleNumber, setVehicleNumber] = useState('');

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
              title: 'ক্যামেরা অ্যাক্সেস নেই',
              description: 'অনুগ্রহ করে আপনার ব্রাউজার সেটিংসে ক্যামেরার অনুমতি সক্রিয় করুন।',
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
            const imageDataUrl = photo.toDataURL('image/png');
            setCapturedImage(imageDataUrl);
        }
    }

    const handleGeneratePass = () => {
        if (!visitorName || !passType) {
            toast({
                variant: "destructive",
                title: "প্রয়োজনীয় তথ্য দিন",
                description: "অনুগ্রহ করে ভিজিটরের নাম এবং পাসের প্রকার দিন।",
            });
            return;
        }

        const newPass: Activity = {
            id: `pass-${Date.now()}`,
            visitorName,
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
        setPassType('');
        setValidFrom('');
        setValidTo('');
        setVehicleNumber('');
        setCapturedImage(null);

        toast({
            title: "পাস তৈরি হয়েছে!",
            description: `${visitorName}-এর জন্য একটি নতুন গেট পাস তৈরি এবং চেক-ইন করা হয়েছে।`,
        });
    }

    return (
        <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="visitor-name">ভিজিটরের নাম</Label>
                        <Input id="visitor-name" placeholder="যেমন, John Doe" value={visitorName} onChange={e => setVisitorName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="pass-type">পাসের প্রকার</Label>
                        <Select value={passType} onValueChange={setPassType}>
                            <SelectTrigger id="pass-type">
                                <SelectValue placeholder="প্রকার নির্বাচন করুন" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Guest">অতিথি/পরিবার</SelectItem>
                                <SelectItem value="Delivery">ডেলিভারি</SelectItem>
                                <SelectItem value="Staff">কর্মী</SelectItem>
                                <SelectItem value="Vehicle">যানবাহন</SelectItem>
                                <SelectItem value="Vendor">ভেন্ডর</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="valid-from">বৈধতার শুরু</Label>
                            <Input id="valid-from" type="datetime-local" value={validFrom} onChange={e => setValidFrom(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="valid-to">বৈধতার শেষ</Label>
                            <Input id="valid-to" type="datetime-local" value={validTo} onChange={e => setValidTo(e.target.value)} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="vehicle-number">গাড়ির নম্বর (ঐচ্ছিক)</Label>
                        <Input id="vehicle-number" placeholder="যেমন, MH12AB1234" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} />
                    </div>
                </div>

                <div className="grid gap-4">
                     <div className="grid gap-2">
                        <Label>ভিজিটরের ছবি (ঐচ্ছিক)</Label>
                        <div className="w-full aspect-video rounded-md border border-dashed flex items-center justify-center bg-muted overflow-hidden">
                           {capturedImage ? (
                                <img src={capturedImage} alt="Captured" className="object-cover w-full h-full" />
                           ) : hasCameraPermission ? (
                             <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted />
                           ): (
                            <div className="text-center p-4">
                                <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">ক্যামেরা পাওয়া যায়নি। অনুগ্রহ করে অনুমতি দিন।</p>
                            </div>
                           )}
                           <canvas ref={photoRef} style={{display: 'none'}} />
                        </div>
                         <Button variant="outline" onClick={takePicture} disabled={!hasCameraPermission}>
                            <Camera className="mr-2 h-4 w-4" />
                            {capturedImage ? 'পুনরায় ছবি তুলুন' : 'ছবি তুলুন'}
                        </Button>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="id-upload">পরিচয়পত্র আপলোড (ঐচ্ছিক)</Label>
                        <Input id="id-upload" type="file" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"/>
                    </div>
                </div>
            </div>
            <Button className="w-full sm:w-auto justify-self-start" onClick={handleGeneratePass}>পাস তৈরি করুন এবং চেক-ইন করুন</Button>
        </div>
    );
}

function ActivePassesList({ passes, onUpdatePass }: { passes: Activity[], onUpdatePass: (id: string, status: Activity['status']) => void }) {
    const activePasses = passes.filter(a => a.status === 'Checked In' || a.status === 'Pending');
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>সক্রিয় ও অপেক্ষমাণ পাস</CardTitle>
          <CardDescription>
            বর্তমানে ভিতরে থাকা বা প্রবেশের জন্য অপেক্ষারত ভিজিটর।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ভিজিটর</TableHead>
                <TableHead>পাসের প্রকার</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead className="text-right">פעולות</TableHead>
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
                        <div className="text-sm text-muted-foreground">চেক ইন: {activity.time}</div>
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
                            ভেরিফাই
                        </Button>
                      )}
                      {activity.status === 'Checked In' && (
                        <Button variant="destructive" size="sm" onClick={() => onUpdatePass(activity.id, 'Checked Out')}>
                            <X className="mr-1 h-3.5 w-3.5" />
                            চেক আউট
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center">কোনো সক্রিয় পাস নেই।</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

export default function GatePassPage() {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);

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
          <TabsTrigger value="generate">পাস তৈরি করুন</TabsTrigger>
          <TabsTrigger value="active">সক্রিয় পাস</TabsTrigger>
          <TabsTrigger value="pre-approved">পূর্ব-অনুমোদিত</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 gap-1">
                <QrCode className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">স্ক্যান পাস</span>
            </Button>
            <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">পূর্ব-অনুমোদন</span>
            </Button>
        </div>
      </div>
      <TabsContent value="generate">
        <Card>
          <CardHeader>
            <CardTitle>নতুন গেট পাস তৈরি করুন</CardTitle>
            <CardDescription>
              নতুন ভিজিটরের জন্য তথ্য পূরণ করুন এবং তার পাস তৈরি করুন।
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
            <CardTitle>পূর্ব-অনুমোদিত ভিজিটর</CardTitle>
            <CardDescription>
              প্রবেশের জন্য আপনার দ্বারা পূর্ব-অনুমোদিত ভিজিটরদের তালিকা।
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">পূর্ব-অনুমোদিত ভিজিটরদের তালিকা এখানে দেখানো হবে।</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
