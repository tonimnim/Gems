'use client';

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
  Trash2,
  Check,
} from 'lucide-react';
import { useNotifications } from '@/context/notification-context';
import { cn } from '@/lib/utils';
import type { NotificationType } from '@/types';

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
      return gemId ? `/gem/${gemId}` : '/anthonychege599';
    case 'payment_success':
    case 'payment_failed':
    case 'new_payment':
      return '/anthonychege599/payments';
    case 'listing_expiring':
      return '/anthonychege599';
    case 'new_gem_pending':
      return '/anthonychege599/verify';
    default:
      return '/anthonychege599';
  }
}

export default function AdminNotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#00AA6C] hover:bg-[#00AA6C]/10 rounded-lg transition-colors"
          >
            <Check className="h-4 w-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 border-2 border-[#00AA6C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Bell className="h-16 w-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No notifications yet</p>
            <p className="text-sm mt-1">You'll be notified when something happens</p>
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
                    }}
                    className="flex gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={cn(
                        'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
                        colorClass
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#00AA6C] mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </Link>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
