import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout role="CANDIDATE">
      {children}
    </DashboardLayout>
  );
}
