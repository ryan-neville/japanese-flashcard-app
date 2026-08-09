"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

/**
 * The routes this app owns, relative to wherever it is mounted. The portfolio
 * mounts these pages under /projects/japanese-flashcards, so an in-app link
 * cannot assume the app sits at the site root.
 */
const routes = ["/phrasebook"];

/** The path this app is mounted at, worked out from the route on screen. */
function mountPath(pathname: string): string {
  for (const route of routes) {
    if (pathname.endsWith(route)) return pathname.slice(0, -route.length);
  }
  // Anything else is the app's index.
  return pathname === "/" ? "" : pathname.replace(/\/+$/, "");
}

type AppLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  /** Target route relative to the app root, e.g. "/" or "/phrasebook". */
  to: string;
};

/** A `Link` whose target is resolved against the app's mount path. */
export default function AppLink({ to, ...props }: AppLinkProps) {
  // usePathname is null until the Pages Router initialises; the site root is
  // the safe assumption there, and matches the standalone deployment.
  const base = mountPath(usePathname() ?? "/");
  const href = to === "/" ? base || "/" : `${base}${to}`;

  return <Link href={href} {...props} />;
}
