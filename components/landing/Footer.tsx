import Link from "next/link";
import { cn } from "@/components/ui/utils";

export type FooterProps = {
  hospitalName?: string;
  contact?: {
    address?: string;
    phone?: string;
    email?: string;
  };
  hours?: {
    weekday?: string;
    saturday?: string;
    sunday?: string;
  };
  links?: { label: string; href: string }[];
  className?: string;
};

const defaultContact = {
  address: "123 Duong ABC, Quan XYZ, TP. HCM",
  phone: "(028) 1234 5678",
  email: "contact@hms.vn",
};

const defaultHours = {
  weekday: "Thu 2 - Thu 6: 7:00 - 17:00",
  saturday: "Thu 7: 7:00 - 12:00",
  sunday: "Chu nhat: Nghi",
};

const defaultLinks = [
  { label: "Dang nhap", href: "/login" },
  { label: "Dang ky", href: "/signup" },
];

export function Footer({
  hospitalName = "HMS Hospital",
  contact = defaultContact,
  hours = defaultHours,
  links = defaultLinks,
  className,
}: FooterProps) {
  return (
    <footer
      className={cn(
        "bg-slate-900 text-slate-200",
        "border-t border-slate-800",
        "px-6 py-12 md:px-8",
        className,
      )}
    >
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{hospitalName}</h3>
          <p className="mt-3 text-sm text-slate-300">
            Dia chi: {contact.address}
          </p>
          <p className="text-sm text-slate-300">Dien thoai: {contact.phone}</p>
          <p className="text-sm text-slate-300">Email: {contact.email}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Gio lam viec</h3>
          <p className="mt-3 text-sm text-slate-300">{hours.weekday}</p>
          <p className="text-sm text-slate-300">{hours.saturday}</p>
          <p className="text-sm text-slate-300">{hours.sunday}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Lien ket</h3>
          <div className="mt-3 space-y-2">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-sm text-slate-300 transition hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl items-center justify-center border-t border-slate-800 pt-6">
        <p className="text-xs text-slate-400">
          © 2025 Hospital Management System. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
