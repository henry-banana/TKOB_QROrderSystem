/**
 * Menu Management Feature - Menu Item Modal
 * 
 * Modal component for creating and editing menu items
 */

import React, { useEffect } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { DIETARY_TAG_OPTIONS, ALLERGEN_OPTIONS, STATUS_OPTIONS } from '../constants';
import type { MenuItemFormData, ModalMode, Category, ModifierGroup, DietaryTag, Allergen, MenuItemStatus } from '../types';
import { useItemPhotos, useSetPrimaryPhoto, useCategory } from '../hooks';

// ============================================================================
// MENU ITEM MODAL
// ============================================================================

interface MenuItemModalProps {
  isOpen: boolean;
  mode: ModalMode;
  itemId?: string;
  formData: MenuItemFormData;
  categories: Category[];
  modifierGroups: ModifierGroup[];
  onClose: () => void;
  onSave: () => void;
  onFormChange: (data: MenuItemFormData) => void;
  isSaving?: boolean;
}

export function MenuItemModal({
  isOpen,
  mode,
  itemId,
  formData,
  categories,
  modifierGroups,
  onClose,
  onSave,
  onFormChange,
  isSaving,
}: MenuItemModalProps) {
  if (!isOpen) return null;

  // Load existing photos when editing
  const { data: existingPhotos = [] } = useItemPhotos(itemId || '', {
    enabled: mode === 'edit' && !!itemId
  });

  // Handle set primary on existing photo
  const setPhotoMutation = useSetPrimaryPhoto();

  const handleSetPrimaryPhoto = async (photoId: string) => {
    if (!itemId) return;
    await setPhotoMutation.mutateAsync({
      itemId,
      photoId,
    });
  };

  const handleDeleteExistingPhoto = (photoId: string) => {
    // Optimistic UI: hide photo, track for delete on save
    const photosToDelete = formData.photosToDelete || [];
    if (!photosToDelete.includes(photoId)) {
      onFormChange({
        ...formData,
        photosToDelete: [...photosToDelete, photoId]
      });
    }
  };

  const toggleDietary = (tag: DietaryTag) => {
    const newDietary = formData.dietary.includes(tag)
      ? formData.dietary.filter((t) => t !== tag)
      : [...formData.dietary, tag];
    onFormChange({ ...formData, dietary: newDietary });
  };

  const toggleAllergen = (allergen: Allergen) => {
    const newAllergens = formData.allergens.includes(allergen)
      ? formData.allergens.filter((a) => a !== allergen)
      : [...formData.allergens, allergen];
    onFormChange({ ...formData, allergens: newAllergens });
  };

  const toggleModifierGroup = (groupId: string) => {
    const currentIds = formData.modifierGroupIds || [];
    const newIds = currentIds.includes(groupId)
      ? currentIds.filter((id) => id !== groupId)
      : [...currentIds, groupId];
    onFormChange({ ...formData, modifierGroupIds: newIds });
  };

  const isValid = formData.name.trim() && formData.price > 0 && formData.categoryId;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white w-full mx-4 rounded-lg shadow-2xl overflow-hidden flex flex-col"
        style={{ maxWidth: '560px', maxHeight: 'calc(100vh - 80px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {mode === 'add' ? 'Add Menu Item' : 'Edit Menu Item'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          {/* EXISTING PHOTOS SECTION (Edit Mode) */}
          {mode === 'edit' && existingPhotos.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-900">Existing Photos</label>
              <div className="space-y-2">
                {existingPhotos
                  .filter(p => !formData.photosToDelete?.includes(p.id))
                  .map((photo) => (
                  <div
                    key={photo.id}
                    className={`border-2 rounded-lg p-3 flex items-start gap-3 transition-colors ${
                      photo.isPrimary
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    {/* Photo Thumbnail */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>

                    {/* Photo Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{photo.filename}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500">{(photo.size / 1024).toFixed(1)} KB</p>
                        {photo.isPrimary && (
                          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500 text-white">
                            Primary
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      {!photo.isPrimary && (
                        <button
                          onClick={() => handleSetPrimaryPhoto(photo.id)}
                          className="text-xs font-semibold text-emerald-600 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Set Primary
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteExistingPhoto(photo.id)}
                        className="text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1 hover:bg-red-100 rounded transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NEW PHOTOS SECTION */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">
              {mode === 'edit' ? 'Add More Photos' : 'Item Photos'}
            </label>
            
            {/* Info Message */}
            {mode === 'add' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex gap-2">
                <span className="text-blue-600 text-lg">💡</span>
                <p className="text-sm text-blue-700">Photos will be uploaded after the item is created</p>
              </div>
            )}

            {/* New Photos List */}
            {formData.photos.length > 0 && (
              <div className="space-y-2 mb-3">
                {formData.photos.map((photo, index) => (
                  <div
                    key={index}
                    className={`border-2 rounded-lg p-3 flex items-start gap-3 transition-colors ${
                      photo.isPrimary
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    {/* Photo Thumbnail */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>

                    {/* Photo Info - Name, Size, and Primary Badge */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{photo.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500">{(photo.size / 1024).toFixed(1)} KB</p>
                        {photo.isPrimary && (
                          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap bg-emerald-500 text-white">
                            Primary
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-shrink-0">
                      {!photo.isPrimary && (
                        <button
                          onClick={() => {
                            const newPhotos = formData.photos.map((p, i) => ({
                              ...p,
                              isPrimary: i === index
                            }));
                            onFormChange({ ...formData, photos: newPhotos });
                          }}
                          className="text-xs font-semibold text-emerald-600 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Set Primary
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const newPhotos = formData.photos.filter((_, i) => i !== index);
                          onFormChange({ ...formData, photos: newPhotos });
                        }}
                        className="text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1 hover:bg-red-100 rounded transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            <label className="border-2 border-dashed border-emerald-300 rounded-lg p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">
                Add more photos
              </p>
              <p className="text-xs text-gray-500">PNG, JPG or WEBP (max. 5MB)</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = e.currentTarget.files;
                  if (files) {
                    const newPhotos = Array.from(files).map((file, index) => ({
                      name: file.name,
                      size: file.size,
                      file: file,
                      displayOrder: formData.photos.length + index, // Auto-assign displayOrder
                      isPrimary: formData.photos.length === 0 && index === 0 // First photo is primary
                    }));
                    onFormChange({ 
                      ...formData, 
                      photos: [...formData.photos, ...newPhotos]
                    });
                  }
                  // Reset input so same file can be selected again
                  e.currentTarget.value = '';
                }}
                className="hidden"
              />
            </label>
          </div>

          {/* Item Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Item Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
              placeholder="e.g., Caesar Salad"
              className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Category *</label>
            <select
              value={formData.categoryId}
              onChange={(e) => onFormChange({ ...formData, categoryId: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
              placeholder="Describe your dish..."
              className="px-4 py-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:border-emerald-500"
              rows={3}
            />
          </div>

          {/* Price & Preparation Time Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Price */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-900">Price *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">
                  $
                </span>
                <input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    const finalValue = isNaN(value) ? 0 : Math.max(0, value);
                    onFormChange({ ...formData, price: finalValue });
                  }}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-7 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Preparation Time */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-900">Prep Time (min)</label>
              <input
                type="number"
                value={formData.preparationTime || ''}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  const finalValue = isNaN(value) ? 0 : Math.max(0, Math.min(240, value));
                  onFormChange({ ...formData, preparationTime: finalValue });
                }}
                placeholder="0"
                min="0"
                max="240"
                className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Display Order */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Display Order</label>
            <input
              type="number"
              value={formData.displayOrder || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                const finalValue = isNaN(value) ? 0 : Math.max(0, value);
                onFormChange({ ...formData, displayOrder: finalValue });
              }}
              placeholder="0"
              min="0"
              className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Status */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Status *</label>
            <select
              value={formData.status}
              onChange={(e) =>
                onFormChange({
                  ...formData,
                  status: e.target.value as MenuItemStatus,
                })
              }
              className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Available Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">
                Available (In Stock)
              </span>
              <span className="text-xs text-gray-500">Mark this item as available for ordering</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) =>
                  onFormChange({ ...formData, available: e.target.checked })
                }
                className="sr-only peer"
              />
              <div
                className={`w-11 h-6 rounded-full relative transition-colors ${
                  formData.available ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${
                    formData.available ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </label>
          </div>

          {/* Dietary Tags */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Dietary Tags</label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_TAG_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleDietary(option.value)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                    formData.dietary.includes(option.value)
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Allergens */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Allergens</label>
            <div className="flex flex-wrap gap-2">
              {ALLERGEN_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleAllergen(option.value)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                    formData.allergens.includes(option.value)
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chef's Recommendation */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">
                Mark as Chef&apos;s recommendation
              </span>
              <span className="text-xs text-gray-500">Highlight this item to customers</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.chefRecommended}
                onChange={(e) =>
                  onFormChange({ ...formData, chefRecommended: e.target.checked })
                }
                className="sr-only peer"
              />
              <div
                className={`w-11 h-6 rounded-full relative transition-colors ${
                  formData.chefRecommended ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${
                    formData.chefRecommended ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </label>
          </div>

          {/* Modifier Groups */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Modifier Groups (Optional)
            </label>
            <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
              {modifierGroups.filter((g) => (g as any).active).length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No active modifier groups
                </p>
              ) : (
                <div className="space-y-2">
                  {modifierGroups
                    .filter((g) => (g as any).active)
                    .map((group: any) => (
                      <label
                        key={group.id}
                        className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={(formData.modifierGroupIds || []).includes(group.id)}
                          onChange={() => toggleModifierGroup(group.id)}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900">{group.name}</span>
                          <span className="ml-2 text-xs text-gray-500">
                            ({group.type === 'single' ? 'Single' : 'Multiple'})
                          </span>
                        </div>
                      </label>
                    ))}
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Select modifier groups for this item (e.g., Size, Toppings, Extras)
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!isValid || isSaving}
            className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : mode === 'add' ? 'Add Item' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ADD CATEGORY MODAL
// ============================================================================
// CATEGORY MODAL
// ============================================================================

interface CategoryModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  categoryId?: string;
  name: string;
  description: string;
  displayOrder: string;
  active: boolean;
  onClose: () => void;
  onSave: () => void;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onDisplayOrderChange: (displayOrder: string) => void;
  onActiveChange: (active: boolean) => void;
  isSaving?: boolean;
}

export function CategoryModal({
  isOpen,
  mode,
  categoryId,
  name,
  description,
  displayOrder,
  active,
  onClose,
  onSave,
  onNameChange,
  onDescriptionChange,
  onDisplayOrderChange,
  onActiveChange,
  isSaving,
}: CategoryModalProps) {
  if (!isOpen) return null;

  // Load fresh category data when editing
  const { data: freshCategoryData } = useCategory(categoryId || '', {
    enabled: mode === 'edit' && !!categoryId
  });

  // Pre-fill form when data loads
  useEffect(() => {
    if (mode === 'edit' && freshCategoryData) {
      onNameChange(freshCategoryData.name);
      onDescriptionChange(freshCategoryData.description || '');
      onDisplayOrderChange(String(freshCategoryData.displayOrder || ''));
      onActiveChange(freshCategoryData.active);
    }
  }, [mode, freshCategoryData, onNameChange, onDescriptionChange, onDisplayOrderChange, onActiveChange]);

  const isValid = name.trim();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white w-full max-w-md mx-4 rounded-lg shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {mode === 'add' ? 'Add Category' : 'Edit Category'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Category Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g., Appetizers"
              className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Description</label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Optional description..."
              className="px-4 py-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:border-emerald-500"
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Display Order</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                const finalValue = isNaN(value) ? '0' : Math.max(0, value).toString();
                onDisplayOrderChange(finalValue);
              }}
              placeholder="0"
              min="0"
              className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            />
            <p className="text-xs text-gray-500">Lower numbers appear first in the list</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Status</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={active}
                  onChange={() => onActiveChange(true)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!active}
                  onChange={() => onActiveChange(false)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">Inactive</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!isValid || isSaving}
            className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSaving ? (mode === 'add' ? 'Creating...' : 'Updating...') : (mode === 'add' ? 'Create Category' : 'Update Category')}
          </button>
        </div>
      </div>
    </div>
  );
}

// Keep AddCategoryModal for backward compatibility
export const AddCategoryModal = CategoryModal;

// ============================================================================
// DELETE CONFIRM MODAL
// ============================================================================

interface DeleteConfirmModalProps {
  isOpen: boolean;
  itemName: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  itemName,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white w-full max-w-md mx-4 rounded-lg shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Delete Menu Item?</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{itemName}</span> will be removed from
            your menu.
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
