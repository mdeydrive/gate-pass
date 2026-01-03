import type { UserRole } from "@/contexts/role-context";

export type Activity = {
  id: string;
  visitorName: string;
  passType: 'Guest' | 'Delivery' | 'Staff' | 'Vehicle' | 'Vendor';
  status: 'Checked In' | 'Checked Out' | 'Pending';
  time: string;
  date: string;
  vehicle?: string;
  photo?: string;
  checkoutTime?: string;
};

export const activities: Activity[] = [
  { id: '1', visitorName: 'John Doe', passType: 'Guest', status: 'Checked In', time: '10:30 AM', date: '2023-10-27', vehicle: 'TS09AB1234' },
  { id: '2', visitorName: 'Jane Smith (Amazon)', passType: 'Delivery', status: 'Checked Out', time: '11:15 AM', date: '2023-10-27' },
  { id: '3', visitorName: 'Maintenance Team', passType: 'Staff', status: 'Checked In', time: '09:00 AM', date: '2023-10-27' },
  { id: '4', visitorName: 'Emily White', passType: 'Guest', status: 'Pending', time: '01:00 PM', date: '2023-10-27' },
  { id: '5', visitorName: 'UPS Delivery', passType: 'Delivery', status: 'Checked In', time: '12:05 PM', date: '2023-10-27' },
  { id: '6', visitorName: 'Alex Green', passType: 'Guest', status: 'Checked Out', time: '02:30 PM', date: '2023-10-26' },
  { id: '7', visitorName: 'Food Delivery', passType: 'Delivery', status: 'Checked Out', time: '08:45 PM', date: '2023-10-26' },
  { id: '8', visitorName: 'Robert Brown', passType: 'Guest', status: 'Checked In', time: '03:00 PM', date: '2023-10-27', vehicle: 'KA01CD5678'},
];

export const users: { name: string; role: UserRole; email: string; avatar: string }[] = [
    { name: 'Admin User', role: 'Admin', email: 'admin@securepass.com', avatar: 'https://avatar.vercel.sh/admin.png' },
    { name: 'Security Guard', role: 'Security', email: 'security@securepass.com', avatar: 'https://avatar.vercel.sh/security.png' },
    { name: 'John Resident', role: 'Resident', email: 'resident@securepass.com', avatar: 'https://avatar.vercel.sh/resident.png' },
    { name: 'Facility Manager', role: 'Manager', email: 'manager@securepass.com', avatar: 'https://avatar.vercel.sh/manager.png' },
];

export const dashboardStats = {
    totalVisitorsToday: 124,
    checkedIn: 78,
    pendingApproval: 5,
    vehiclesInside: 42,
};

export const activityChartData = [
  { time: "8 AM", visitors: 10, deliveries: 2 },
  { time: "9 AM", visitors: 15, deliveries: 5 },
  { time: "10 AM", visitors: 25, deliveries: 7 },
  { time: "11 AM", visitors: 30, deliveries: 12 },
  { time: "12 PM", visitors: 28, deliveries: 15 },
  { time: "1 PM", visitors: 35, deliveries: 10 },
  { time: "2 PM", visitors: 40, deliveries: 8 },
  { time: "3 PM", visitors: 38, deliveries: 6 },
];

export const complexes = [
  { id: 'c1', name: 'Tower A', blocks: 1, floors: 20, units: 80 },
  { id: 'c2', name: 'Tower B', blocks: 1, floors: 25, units: 100 },
  { id: 'c3', name: 'Commercial Block', blocks: 2, floors: 5, units: 50 },
  { id: 'c4', name: 'Villa Community', blocks: 5, floors: 2, units: 30 },
];
