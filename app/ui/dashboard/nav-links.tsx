"use client"

import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

import Link from 'next/link'
import clsx from 'clsx'

import { usePathname } from 'next/navigation';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  {
    name: 'Overall Price',
    href: '/dashboard',
    icon: ChartBarIcon,
  },
  {
    name: 'Find House',
    href: '/dashboard/find-house',
    icon: HomeIcon,
  },
  {
    name: 'Chatbot',
    href: '/dashboard/chatbot',
    icon: ChatBubbleLeftRightIcon, // Assuming an appropriate icon; adjust if needed
  },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-emerald-50 hover:text-emerald-700 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-emerald-100 text-emerald-800': pathname === link.href,
              },
            )}>
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
