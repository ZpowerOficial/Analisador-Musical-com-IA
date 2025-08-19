
import React from 'react';

export const ComposerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M2 15.5s1-1 2-1 1.5 1 2.5 1 2.5-2 3.5-2 3.5 2 4.5 2 2-1 3-1" />
    <path d="M14 22v-4.5" />
    <path d="M10 22v-4.5" />
    <path d="m14 2-4.5 4.5" />
    <path d="M14 22l-1.5-1.5" />
    <path d="M10 22l1.5-1.5" />
  </svg>
);
