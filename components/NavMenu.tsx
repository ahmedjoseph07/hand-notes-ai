"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import {
  ClerkLoading,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";

import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { NavMenuProps } from "@/types";

const userButtonAppearance = {
  elements: { avatarBox: "size-9 ring-2 ring-[var(--bg-secondary)]" },
};

/** First name (or username) next to the avatar: `.nav-user-name` */
function UserName() {
  const { user } = useUser();
  const name = user?.firstName ?? user?.username;
  return name ? <span className="nav-user-name">{name}</span> : null;
}

const isActive = (pathname: string | null, href: string): boolean => {
  // In-page anchors (e.g. /#features) are never "the current page"
  if (!pathname || href.includes("#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
};

/** Reads the current URL. Render inside <Suspense> (see Navbar). */
export function ActiveNavMenu() {
  const pathname = usePathname();
  return <NavMenu pathname={pathname} />;
}

/** Desktop links + actions, and the mobile menu. `pathname: null` = no active state (Suspense fallback). */
export function NavMenu({ pathname }: NavMenuProps) {
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const panelId = useId();

  // Close the mobile menu whenever the route changes (incl. back/forward)
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  // While open: Escape closes, growing to desktop closes, page behind doesn't scroll
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onBreakpoint = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    const prevOverflow = document.body.style.overflow;

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onBreakpoint);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpoint);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      {/* ---------- Desktop (lg+) ---------- */}
      <nav aria-label="Main" className="hidden lg:flex items-center gap-8">
        {NAV_ITEMS.map(({ label, href }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "nav-link-base px-1 lg:px-2 cursor-pointer",
                active
                  ? "nav-link-active"
                  : "border-b-2 border-transparent pb-0.5 text-[var(--text-primary)] hover:text-[var(--color-brand)]",
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="hidden lg:flex items-center gap-5">
        {/* Holds the space while Clerk loads, so the links don't shift */}
        <ClerkLoading>
          <div aria-hidden className="h-12 w-[205px]" />
        </ClerkLoading>
        <Show when="signed-out">
          <SignInButton>
            <button type="button" className="nav-btn">
              Sign in
            </button>
          </SignInButton>
          <SignUpButton>
            <button type="button" className="btn-primary cursor-pointer">
              Get started
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <Link href="/library" className="btn-primary">
            Open app
          </Link>
          <div className="nav-user-link">
            <UserButton appearance={userButtonAppearance} />
            <UserName />
          </div>
        </Show>
      </div>
      
      {/* ---------- Mobile & tablet (< lg) ---------- */}
      <div className="lg:hidden flex items-center gap-2">
        <Show when="signed-in">
          <UserButton appearance={userButtonAppearance} />
        </Show>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
          className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]"
        >
          {open ? (
            <X className="size-6" aria-hidden />
          ) : (
            <Menu className="size-6" aria-hidden />
          )}
        </button>
      </div>
      {open && (
        <>
          <div
            aria-hidden
            onClick={close}
            className="lg:hidden fixed inset-x-0 bottom-0 top-[var(--navbar-height)] bg-(color:--text-primary)/20 backdrop-blur-[2px] animate-in fade-in duration-200"
          />
          <div
            id={panelId}
            className="lg:hidden absolute inset-x-0 top-full border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] shadow-soft-md animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <nav
              aria-label="Mobile"
              className="wrapper flex flex-col gap-1 py-4"
            >
              {NAV_ITEMS.map(({ label, href }) => {
                const active = isActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-[10px] px-4 py-3 text-lg font-medium transition-colors",
                      active
                        ? "bg-[var(--accent-light)] text-[var(--color-brand)]"
                        : "text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]",
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            <Show when="signed-in">
              <div className="wrapper border-t border-[var(--border-subtle)] pt-4 pb-6">
                <Link href="/library" onClick={close} className="btn-primary w-full">
                  Open app
                </Link>
              </div>
            </Show>
            <Show when="signed-out">
              <div className="wrapper flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-4 pb-6">
                <SignInButton>
                  <button
                    type="button"
                    className="btn-secondary w-full cursor-pointer border border-[var(--border-subtle)]"
                  >
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button
                    type="button"
                    className="btn-primary w-full cursor-pointer"
                  >
                    Get started
                  </button>
                </SignUpButton>
              </div>
            </Show>
          </div>
        </>
      )}
    </>
  );
}
