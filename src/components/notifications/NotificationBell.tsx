'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  Star,
  CheckCircle,
  XCircle,
  CreditCard,
  Clock,
  Heart,
  RefreshCw,
  FileCheck,
  X,
  Check,
} from 'lucide-react';
import { useNotifications } from '@/context/notification-context';
import { cn } from '@/lib/utils';
import type { NotificationType } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const notificationIcons: Record<NotificationType, React.ElementType> = {
  new_review: Star,
  gem_approved: CheckCircle,
  gem_rejected: XCircle,
  payment_success: CreditCard,
  payment_failed: CreditCard,
  listing_expiring: Clock,
  gem_saved: Heart,
  saved_gem_updated: RefreshCw,
  new_gem_pending: FileCheck,
  new_payment: CreditCard,
};

const notificationColors: Record<NotificationType, string> = {
  new_review: 'text-amber-500 bg-amber-50',
  gem_approved: 'text-green-500 bg-green-50',
  gem_rejected: 'text-red-500 bg-red-50',
  payment_success: 'text-green-500 bg-green-50',
  payment_failed: 'text-red-500 bg-red-50',
  listing_expiring: 'text-orange-500 bg-orange-50',
  gem_saved: 'text-pink-500 bg-pink-50',
  saved_gem_updated: 'text-blue-500 bg-blue-50',
  new_gem_pending: 'text-purple-500 bg-purple-50',
  new_payment: 'text-green-500 bg-green-50',
};

function getNotificationLink(notification: { type: NotificationType; data?: { gem_id?: string } }): string {
  const gemId = notification.data?.gem_id;

  switch (notification.type) {
    case 'new_review':
    case 'gem_approved':
    case 'gem_rejected':
    case 'gem_saved':
    case 'saved_gem_updated':
      return gemId ? `/gem/${gemId}` : '/dashboard';
    case 'payment_success':
    case 'payment_failed':
      return '/dashboard/payments';
    case 'listing_expiring':
      return '/dashboard';
    case 'new_gem_pending':
      return '/anthonychege599/verify';
    case 'new_payment':
      return '/anthonychege599/payments';
    default:
      return '/dashboard';
  }
}

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="relative p-2 text-gray-600 hover:text-[#00AA6C] transition-colors outline-none">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 p-0 max-h-[70vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="text-xs text-[#00AA6C] hover:text-[#008f5a] font-medium flex items-center gap-1"
            >
              <Check className="h-3 w-3" />
              Mark all read
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 border-2 border-[#00AA6C] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Bell className="h-10 w-10 mb-2 text-gray-300" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type] || Bell;
                const colorClass = notificationColors[notification.type] || 'text-gray-500 bg-gray-50';
                const link = getNotificationLink(notification);

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'relative group',
                      !notification.read && 'bg-[#00AA6C]/5'
                    )}
                  >
                    <Link
                      href={link}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification.id);
                        }
                        setIsOpen(false);
                      }}
                      className="flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className={cn(
                          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                          colorClass
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#00AA6C] mt-2" />
                      )}
                    </Link>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-gray-100 p-2">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="block w-full py-2 text-center text-sm text-[#00AA6C] hover:text-[#008f5a] font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              View all notifications
            </Link>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
