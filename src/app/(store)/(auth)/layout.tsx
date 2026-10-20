import { AuthPlate } from "@/components/account/auth-plate";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="frame grid gap-10 py-12 md:grid-cols-12 md:gap-6 md:py-16">
      <div className="md:col-span-6 md:pr-6 lg:col-span-5 lg:pr-0">{children}</div>
      <div className="hidden md:col-span-6 md:col-start-7 md:block lg:col-span-6 lg:col-start-7">
        <AuthPlate />
      </div>
    </div>
  );
}
