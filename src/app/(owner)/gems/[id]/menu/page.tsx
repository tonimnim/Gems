'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, Plus, Pencil, Trash2, GripVertical,
  ImageIcon, Loader2, Star, Check, X
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea, Badge } from '@/components/ui';
import { useAuth } from '@/context/auth-context';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { useImageUpload } from '@/components/ui/cloudinary-image';
import type { MenuItem, Gem } from '@/types';

// Common menu categories
const MENU_CATEGORIES = [
  'Starters',
  'Main Course',
  'Sides',
  'Desserts',
  'Drinks',
  'Specials',
];

interface MenuItemFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  image_url: string;
  is_available: boolean;
  is_featured: boolean;
}

const emptyFormData: MenuItemFormData = {
  name: '',
  description: '',
  price: '',
  category: 'Main Course',
  image_url: '',
  is_available: true,
  is_featured: false,
};

export default function MenuManagementPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const gemId = params.id as string;

  const [gem, setGem] = useState<Gem | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuItemFormData>(emptyFormData);
  const [error, setError] = useState<string | null>(null);

  const { upload, uploading } = useImageUpload();

  // Fetch gem and menu items
  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      // Fetch gem
      const { data: gemData, error: gemError } = await supabase
        .from('gems')
        .select('*')
        .eq('id', gemId)
        .single();

      if (gemError || !gemData) {
        setError('Gem not found');
        setLoading(false);
        return;
      }

      // Check if user is owner
      if (gemData.owner_id !== user?.id) {
        setError('You do not have permission to manage this menu');
        setLoading(false);
        return;
      }

      // Check if gem is eat_drink category
      if (gemData.category !== 'eat_drink') {
        setError('Menu is only available for food & drink establishments');
        setLoading(false);
        return;
      }

      setGem(gemData);

      // Fetch menu items
      const { data: menuData } = await supabase
        .from('menu_items')
        .select('*')
        .eq('gem_id', gemId)
        .order('category')
        .order('order');

      setMenuItems(menuData || []);
      setLoading(false);
    }

    if (user) {
      fetchData();
    }
  }, [gemId, user]);

  const handleImageUpload = async (file: File) => {
    const result = await upload(file, 'menus');
    if (result) {
      setFormData((prev) => ({ ...prev, image_url: result.url }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();

    const itemData = {
      gem_id: gemId,
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      currency: 'KES',
      category: formData.category,
      image_url: formData.image_url || null,
      is_available: formData.is_available,
      is_featured: formData.is_featured,
      order: editingItem ? editingItem.order : menuItems.length,
    };

    if (editingItem) {
      // Update existing item
      const { data, error: updateError } = await supabase
        .from('menu_items')
        .update(itemData)
        .eq('id', editingItem.id)
        .select()
        .single();

      if (updateError) {
        setError(updateError.message);
      } else if (data) {
        setMenuItems((prev) =>
          prev.map((item) => (item.id === editingItem.id ? data : item))
        );
        resetForm();
      }
    } else {
      // Create new item
      const { data, error: insertError } = await supabase
        .from('menu_items')
        .insert(itemData)
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
      } else if (data) {
        setMenuItems((prev) => [...prev, data]);
        resetForm();
      }
    }

    setSaving(false);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category,
      image_url: item.image_url || '',
      is_available: item.is_available,
      is_featured: item.is_featured,
    });
    setShowForm(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', itemId);

    if (!deleteError) {
      setMenuItems((prev) => prev.filter((item) => item.id !== itemId));
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    const supabase = createClient();
    const { data, error: updateError } = await supabase
      .from('menu_items')
      .update({ is_available: !item.is_available })
      .eq('id', item.id)
      .select()
      .single();

    if (!updateError && data) {
      setMenuItems((prev) =>
        prev.map((i) => (i.id === item.id ? data : i))
      );
    }
  };

  const resetForm = () => {
    setFormData(emptyFormData);
    setEditingItem(null);
    setShowForm(false);
  };

  // Group items by category
  const menuByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (error && !gem) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Menu Management</h1>
          <p className="text-gray-600">{gem?.name}</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Add Menu Item
          </Button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., Grilled Tilapia"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (KES) *</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, price: e.target.value }))
                    }
                    placeholder="850"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Describe the dish, ingredients, etc."
                  rows={2}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    required
                  >
                    {MENU_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Image (Optional)</label>
                  <div className="flex items-center gap-2">
                    {formData.image_url ? (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                        <Image
                          src={formData.image_url}
                          alt="Menu item"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, image_url: '' }))
                          }
                          className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                          className="hidden"
                        />
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ImageIcon className="h-4 w-4" />
                        )}
                        <span className="text-sm">Upload Image</span>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_available: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Available</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_featured: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Signature Dish</span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t">
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingItem ? 'Update Item' : 'Add Item'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Menu Items List */}
      {menuItems.length === 0 && !showForm ? (
        <Card>
          <CardContent className="text-center py-12">
            <ImageIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="font-semibold mb-2">No Menu Items Yet</h3>
            <p className="text-gray-600 mb-4">
              Start adding items to your menu for customers to see.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(menuByCategory).map(([category, items]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 p-3 rounded-lg border ${
                        !item.is_available ? 'bg-gray-50 opacity-60' : ''
                      }`}
                    >
                      {/* Drag handle placeholder */}
                      <GripVertical className="h-5 w-5 text-gray-300 cursor-grab" />

                      {/* Image */}
                      {item.image_url ? (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="h-6 w-6 text-gray-300" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium truncate">{item.name}</h4>
                          {item.is_featured && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                          )}
                          {!item.is_available && (
                            <Badge variant="secondary">Unavailable</Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 truncate">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Price */}
                      <div className="font-semibold text-[var(--primary)]">
                        {formatCurrency(item.price, item.currency)}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAvailability(item)}
                          title={item.is_available ? 'Mark unavailable' : 'Mark available'}
                        >
                          {item.is_available ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-1">Tips for a great menu</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>- Add images for your signature dishes to attract more customers</li>
          <li>- Use the star to highlight your best-selling items</li>
          <li>- Mark items as unavailable instead of deleting for seasonal dishes</li>
        </ul>
      </div>
    </div>
  );
}
