
import type { UserRole } from "@/contexts/role-context";

export type Activity = {
  id: string;
  visitorName: string;
  mobileNumber?: string;
  passType: 'Guest' | 'Delivery' | 'Staff' | 'Vehicle' | 'Vendor';
  status: 'Checked In' | 'Checked Out' | 'Pending' | 'Approved' | 'Rejected';
  time: string;
  date: string;
  vehicle?: string;
  photo?: string;
  companyName?: string;
  location?: string;
  approverIds?: string[];
  requesterId?: string;
  approvedAt?: string;
  approvedById?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  visitingLocation?: string;
  purposeOfVisit?: string;
};

export type Permission = 
    | "dashboard"
    | "gate-pass"
    | "history"
    | "visitors"
    | "management"
    | "approving-authorities"
    | "alerts"
    | "vehicles"
    | "database"
    | "deliveries"
    | "staff"
    | "settings"
    | "reports";


export type ApprovingAuthority = {
  id: string;
  name: string;
  role: string;
  mobileNumber: string;
  email: string;
  avatar: string;
  status: 'Active' | 'Inactive';
  permissions: Permission[];
};

export const allPermissions: { id: Permission, label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "gate-pass", label: "Manage Gate Pass" },
    { id: "history", label: "History" },
    { id: "visitors", label: "Visitors" },
    { id: "management", label: "Complex Management" },
    { id: "approving-authorities", label: "Approving Authorities" },
    { id: "alerts", label: "Alerts" },
    { id: "vehicles", label: "Vehicles" },
    { id: "database", label: "Database" },
    { id: "deliveries", label: "Deliveries" },
    { id: "staff", label: "Staff" },
    { id: "settings", label: "Settings" },
    { id: "reports", label: "Reports" },
];

export const activities: Activity[] = [
  { id: '1', visitorName: 'John Doe', mobileNumber: '9876543210', passType: 'Guest', status: 'Approved', time: '10:30 AM', date: '2023-10-27', vehicle: 'TS09AB1234' },
  { id: '2', visitorName: 'Jane Smith (Amazon)', mobileNumber: '9876543211', passType: 'Delivery', status: 'Checked Out', time: '11:15 AM', date: '2023-10-27', checkedOutAt: '2023-10-27T11:45:00Z', companyName: 'Amazon', location: 'Local Hub' },
  { id: '3', visitorName: 'Maintenance Team', mobileNumber: '9876543212', passType: 'Staff', status: 'Checked In', time: '09:00 AM', date: '2023-10-27', companyName: 'Urban Company', location: 'City Branch' },
  { id: '4', visitorName: 'Emily White', mobileNumber: '9876543213', passType: 'Guest', status: 'Pending', time: '01:00 PM', date: '2023-10-27' },
  { id: '5', visitorName: 'UPS Delivery', mobileNumber: '9876543214', passType: 'Delivery', status: 'Checked In', time: '12:05 PM', date: '2023-10-27', companyName: 'UPS', location: 'Main Depot' },
  { id: '6', visitorName: 'Alex Green', mobileNumber: '9876543215', passType: 'Guest', status: 'Checked Out', time: '02:30 PM', date: '2023-10-26', checkedOutAt: '2023-10-26T16:00:00Z' },
  { id: '7', visitorName: 'Food Delivery', mobileNumber: '9876543216', passType: 'Delivery', status: 'Checked Out', time: '08:45 PM', date: '2023-10-26', checkedOutAt: '2023-10-26T21:00:00Z' },
  { id: '8', visitorName: 'Robert Brown', mobileNumber: '9876543217', passType: 'Guest', status: 'Checked In', time: '03:00 PM', date: '2023-10-27', vehicle: 'KA01CD5678'},
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

export const approvingAuthorities: ApprovingAuthority[] = [
  { id: 'auth1', name: 'Michael Scott', role: 'Manager', mobileNumber: '9123456780', email: 'michael.s@securepass.com', avatar: 'https://avatar.vercel.sh/michael.png', status: 'Active', permissions: [] },
  { id: 'auth2', name: 'Dwight Schrute', role: 'Asst. to the Manager', mobileNumber: '9123456781', email: 'dwight.s@securepass.com', avatar: 'https://avatar.vercel.sh/dwight.png', status: 'Active', permissions: [] },
  { id: 'auth3', name: 'Jim Halpert', role: 'Administrator', mobileNumber: '9123456782', email: 'jim.h@securepass.com', avatar: 'https://avatar.vercel.sh/jim.png', status: 'Active', permissions: [] },
  { id: 'auth4', name: 'Pam Beesly', role: 'Administrator', mobileNumber: '9123456783', email: 'pam.b@securepass.com', avatar: 'https://avatar.vercel.sh/pam.png', status: 'Active', permissions: [] },
];
