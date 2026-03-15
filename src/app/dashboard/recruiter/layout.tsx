import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout role="RECRUITER">
      {children}
    </DashboardLayout>
  );
}
