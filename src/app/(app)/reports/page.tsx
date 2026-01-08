
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useGatePass } from '@/contexts/gate-pass-context';
import { useState, useMemo, useRef } from 'react';
import type { DateRange } from 'react-day-picker';
import { format, isWithinInterval, startOfDay, endOfDay, parse, isValid } from 'date-fns';
import { Printer, Users, Package, Car, Building } from 'lucide-react';
import type { Activity } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { useReactToPrint } from 'react-to-print';

const getBadgeVariant = (status: Activity['status']) => {
    switch (status) {
      case 'Checked In': return 'default';
      case 'Checked Out': return 'success';
      case 'Pending': return 'destructive';
      case 'Approved': return 'secondary';
      case 'Rejected': return 'destructive';
      default: return 'outline';
    }
};

const passTypes: Activity['passType'][] = ['Guest', 'Delivery', 'Staff', 'Vehicle', 'Vendor'];
const passStatuses: Activity['status'][] = ['Checked In', 'Checked Out', 'Pending', 'Approved', 'Rejected'];

export default function ReportsPage() {
  const { activities, loading } = useGatePass();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });
  const [passTypeFilter, setPassTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'Gate Pass Report',
  });

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
        const activityDate = parse(activity.date, 'yyyy-MM-dd', new Date());

        if (!isValid(activityDate)) return false;
      
        const dateMatch = dateRange?.from && dateRange?.to 
            ? isWithinInterval(activityDate, { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) })
            : true;
      
      const passTypeMatch = passTypeFilter === 'all' || activity.passType === passTypeFilter;
      const statusMatch = statusFilter === 'all' || activity.status === statusFilter;

      return dateMatch && passTypeMatch && statusMatch;
    });
  }, [activities, dateRange, passTypeFilter, statusFilter]);

  const reportStats = useMemo(() => {
    const totalVisitors = filteredActivities.length;
    const passesByType = passTypes.reduce((acc, type) => {
        acc[type] = filteredActivities.filter(a => a.passType === type).length;
        return acc;
    }, {} as Record<Activity['passType'], number>);

    const activityByHour = Array(24).fill(0).map((_, hour) => {
        const count = filteredActivities.filter(a => a.checkedInAt && new Date(a.checkedInAt).getHours() === hour).length;
        return { hour: `${hour}:00`, count };
    });
    
    const peakHour = activityByHour.reduce((max, hour) => hour.count > max.count ? hour : max, { hour: 'N/A', count: 0 });

    return { totalVisitors, passesByType, peakHour: peakHour.hour };

  }, [filteredActivities]);

  const chartData = useMemo(() => {
    return passTypes.map(type => ({
        name: type,
        count: reportStats.passesByType[type] || 0,
    }));
  }, [reportStats.passesByType]);


  return (
    <div className="flex flex-col gap-6">
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle>Generate Reports</CardTitle>
                    <CardDescription>
                        Filter and view reports for gate pass activities.
                    </CardDescription>
                </div>
                <Button onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Report
                </Button>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
                <DatePicker 
                    date={dateRange?.from} 
                    onDateChange={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                    placeholder="From date"
                />
                 <DatePicker 
                    date={dateRange?.to} 
                    onDateChange={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                    placeholder="To date"
                />
                 <Select value={passTypeFilter} onValueChange={setPassTypeFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by pass type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Pass Types</SelectItem>
                        {passTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {passStatuses.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>

        <div ref={printRef} className="print-container space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Passes</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{reportStats.totalVisitors}</div>}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Guests</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{reportStats.passesByType.Guest}</div>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Deliveries</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{reportStats.passesByType.Delivery}</div>}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{reportStats.peakHour}</div>}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Activity Breakdown</CardTitle>
                    <CardDescription>A visual summary of passes by type for the selected period.</CardDescription>
                </CardHeader>
                <CardContent>
                     {loading ? (
                        <Skeleton className="h-[300px] w-full" />
                    ) : (
                    <ChartContainer config={{}} className="h-[300px] w-full">
                        <ResponsiveContainer>
                            <BarChart data={chartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis />
                                <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Detailed Report</CardTitle>
                    <CardDescription>A full log of all activities matching the current filters.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                         <div className="space-y-2">
                            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Visitor</TableHead>
                                    <TableHead>Pass Type</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredActivities.length > 0 ? filteredActivities.map(activity => (
                                    <TableRow key={activity.id}>
                                        <TableCell>
                                            <div className="font-medium">{activity.visitorName}</div>
                                            <div className="text-sm text-muted-foreground">{activity.mobileNumber}</div>
                                        </TableCell>
                                        <TableCell>{activity.passType}</TableCell>
                                        <TableCell>{format(new Date(activity.date), 'PPP')} at {activity.time}</TableCell>
                                        <TableCell><Badge variant={getBadgeVariant(activity.status)}>{activity.status}</Badge></TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No results found for the selected filters.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    )}
                </CardContent>
            </Card>
        </div>
        <style jsx global>{`
            @media print {
                body * {
                    visibility: hidden;
                }
                .print-container, .print-container * {
                    visibility: visible;
                }
                .print-container {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
                .no-print {
                    display: none;
                }
            }
        `}</style>
    </div>
  );
}
