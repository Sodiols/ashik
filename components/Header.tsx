"use client";
import { navigation, type SectionId } from "@/data/site";
import { AvailabilityIndicator } from "./AvailabilityIndicator";
type Props = {
  active: SectionId;
  onNavigate: (
    id: SectionId,
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => void;
};
export function Header({ active, onNavigate }: Props) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="header safe-header flex items-center justify-between">
        <a
          className="wordmark tap-target inline-flex items-center"
          href="#home"
          aria-label="Ashik Rabbani, home"
          onClick={(e) => onNavigate("home", e)}
        >
          ASHIK RABBANI
          <span className="brand-dot" aria-hidden="true" />
        </a>
        <nav className="flex" aria-label="Main navigation">
          {navigation.map((item) => (
            <a
              className="tap-target"
              key={item.href}
              href={item.href}
              aria-current={
                active === item.href.slice(1) ? "location" : undefined
              }
              onClick={(e) => onNavigate(item.href.slice(1) as SectionId, e)}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>
      <AvailabilityIndicator />
    </>
  );
}
