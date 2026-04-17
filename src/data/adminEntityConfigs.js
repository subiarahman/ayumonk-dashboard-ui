export const companyFields = [
  {
    name: "company_name",
    label: "Company Name",
    required: true,
    minWidth: 220,
  },
  { name: "industry", label: "Industry", required: true },
  {
    name: "size_bucket",
    label: "Size Bucket",
    type: "select",
    required: true,
    options: ["SMALL", "MEDIUM", "LARGE", "ENTERPRISE"],
  },
  { name: "email", label: "Email", required: true, minWidth: 220 },
  { name: "phone", label: "Phone", required: true, minWidth: 150 },
  {
    name: "no_of_employees",
    label: "No. of Employees",
    type: "number",
    required: true,
    minWidth: 160,
  },
];

export const companyRows = [
  {
    id: "company-1",
    company_name: "Ally Wired Soft Solutions",
    industry: "IT",
    size_bucket: "SMALL",
    email: "test@gmail.com",
    phone: "9876787656",
    no_of_employees: 300,
  },
  {
    id: "company-2",
    company_name: "Northwind Health Labs",
    industry: "Healthcare",
    size_bucket: "MEDIUM",
    email: "contact@northwindhealth.com",
    phone: "9123456780",
    no_of_employees: 620,
  },
];

export const userFields = [
  { name: "employee_id", label: "Employee ID", required: true, minWidth: 140 },
  { name: "full_name", label: "Full Name", required: true, minWidth: 200 },
  {
    name: "department",
    label: "Department",
    required: true,
    type: "select",
    options: ["Sales", "Marketing", "Finance", "HR", "Engineering", "Product"],
  },
  {
    name: "location",
    label: "Location",
    required: true,
    type: "select",
    options: ["New York", "Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Pune"],
  },
  {
    name: "gender",
    label: "Gender",
    required: true,
    type: "select",
    options: ["Male", "Female", "Other"],
  },
  { name: "phone", label: "Phone", required: true, minWidth: 150 },
  { name: "email", label: "Email", required: true, minWidth: 220 },
  {
    name: "company_name",
    label: "Company Name",
    required: true,
    minWidth: 220,
  },
];

export const userRows = [
  {
    id: "user-1",
    employee_id: "E001",
    full_name: "Employee_1",
    department: "Sales",
    location: "New York",
    gender: "Male",
    phone: "9876500000",
    email: "employee1@company.com",
    company_name: "Ally Wired Soft Solutions",
  },
  {
    id: "user-2",
    employee_id: "E002",
    full_name: "Priya Sharma",
    department: "Engineering",
    location: "Bengaluru",
    gender: "Female",
    phone: "9876500001",
    email: "priya.sharma@northwindhealth.com",
    company_name: "Northwind Health Labs",
  },
];

export const questionFields = [
  { name: "1", label: "Scale 1", required: true, minWidth: 120 },
  { name: "2", label: "Scale 2", required: true, minWidth: 120 },
  { name: "3", label: "Scale 3", required: true, minWidth: 120 },
  { name: "4", label: "Scale 4", required: true, minWidth: 120 },
  { name: "5", label: "Scale 5", required: true, minWidth: 120 },
  { name: "Theme", label: "Theme", required: true, minWidth: 220 },
  { name: "KPI", label: "KPI", required: true, minWidth: 180 },
  {
    name: "Question_Code",
    label: "Question Code",
    required: true,
    minWidth: 160,
  },
  {
    name: "Question",
    label: "Question",
    required: true,
    type: "multiline",
    minWidth: 280,
    fullWidth: true,
  },
  {
    name: "Reverse_Coded",
    label: "Reverse Coded",
    required: true,
    type: "select",
    options: ["Yes", "No"],
    minWidth: 150,
  },
];

export const questionRows = [];

export const entityConfigs = {
  company: {
    title: "Company Master",
    description:
      "Manage company records with dedicated pages for viewing, adding, and editing.",
    entityLabel: "Company",
    basePath: "/super-admin/company-data",
    storageKey: "admin-company-records",
    fields: companyFields,
    initialRows: companyRows,
  },
  user: {
    title: "Company Users",
    description:
      "Manage employee records with dedicated pages for viewing, adding, and editing.",
    entityLabel: "User",
    basePath: "/admin/company-users",
    storageKey: "admin-user-records",
    fields: userFields,
    initialRows: userRows,
  },
  question: {
    title: "Question Bank",
    description:
      "Manage question records with dedicated pages for viewing, adding, and editing.",
    entityLabel: "Question",
    basePath: "/admin/questions",
    storageKey: "admin-question-records",
    fields: questionFields,
    initialRows: questionRows,
  },
};
