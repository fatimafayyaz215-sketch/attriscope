import PublicHeader, { publicHeaderOffsetClass } from "@/components/layout/PublicHeader";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicHeader />
      <div className={publicHeaderOffsetClass}>{children}</div>
    </>
  );
}
