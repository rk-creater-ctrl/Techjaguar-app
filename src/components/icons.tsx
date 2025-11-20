import type { SVGProps } from 'react';

export function TechJaguarLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M10.15 12.85a1 1 0 1 0-1.3 1.3" />
      <path d="M15.15 12.85a1 1 0 1 0-1.3 1.3" />
      <path d="M17.6 15.25c-1.2-.6-2.5-1-3.85-1.15" />
      <path d="M9.25 14.1c-1.35.15-2.65.55-3.85 1.15" />
      <path d="M12 18.25c.7-.7 1.3-1.5 1.6-2.4" />
      <path d="m19 12-7-9-7 9" />
      <path d="M19 12v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-4" />
    </svg>
  );
}
