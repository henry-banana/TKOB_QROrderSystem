/**
 * Menu Management Feature - UI Components
 * 
 * Colocated components for menu management UI
 * Following feature-based architecture with component colocation
 */

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Image as ImageIcon, 
  Star,
  Leaf,
  Flame,
  ChevronDown,
  Check
} from 'lucide-react';
import { Badge, Select } from '@/shared/components';
import { STATUS_FILTER_OPTIONS, SORT_OPTIONS, ARCHIVE_STATUS_OPTIONS } from '../constants';
import type { Category, SortOption, DietaryTag } from '../types';

// ============================================================================
// CATEGORY SIDEBAR
// ============================================================================

interface CategorySidebarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  onAddCategory: () => void;
  onDeleteCategory: (categoryId: string) => void;
  onEditCategory: (category: Category) => void;
  onToggleActive: (category: Category) => void;
  activeOnly: boolean;
  onActiveOnlyChange: (value: boolean) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  isLoading?: boolean;
}

export function CategorySidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  onAddCategory,
  onDeleteCategory,
  onEditCategory,
  onToggleActive,
  activeOnly,
  onActiveOnlyChange,
  sortBy,
  onSortChange,
  isLoading,
}: CategorySidebarProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle button click - toggle menu
  const handleMenuButtonClick = (categoryId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    
    if (openMenuId === categoryId) {
      // Close if already open
      setOpenMenuId(null);
      setMenuPosition(null);
    } else {
      // Open and calculate position
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      
      setMenuPosition({
        top: rect.top,
        left: rect.right + 8
      });
      setOpenMenuId(categoryId);
    }
  };

  // Close menu on outside click
  useEffect(() => {
    if (!openMenuId) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      
      // Check if click is outside menu
      if (menuRef.current && !menuRef.current.contains(target)) {
        // Check if click is outside button
        const clickedButton = Array.from(buttonRefs.current.values()).find(btn => btn.contains(target));
        if (!clickedButton) {
          setOpenMenuId(null);
          setMenuPosition(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openMenuId) {
        setOpenMenuId(null);
        setMenuPosition(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [openMenuId]);

  // Filter and sort categories
  const getFilteredAndSortedCategories = () => {
    let filtered = categories.filter(cat => !activeOnly || cat.active);
    
    return filtered.sort((a, b) => {
      switch(sortBy) {
        case 'displayOrder':
          return a.displayOrder - b.displayOrder;
        case 'nameAsc':
          return a.name.localeCompare(b.name);
        case 'nameDesc':
          return b.name.localeCompare(a.name);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return a.displayOrder - b.displayOrder;
      }
    });
  };

  const filteredCategories = getFilteredAndSortedCategories();

  return (
    <aside className="hidden lg:flex w-64 h-full bg-gray-50 border-r border-gray-200 flex-col min-h-0 overflow-hidden">
      {/* Header - Fixed */}
      <div className="shrink-0 p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
        
        {/* Active Only Filter */}
        <div className="mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => onActiveOnlyChange(e.target.checked)}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-gray-700">Active Only</span>
          </label>
        </div>

        {/* Sort Dropdown */}
        <div className="mb-4">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="displayOrder">Display Order</option>
            <option value="nameAsc">Name A-Z</option>
            <option value="nameDesc">Name Z-A</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        <button
          onClick={onAddCategory}
          className="w-full h-11 px-4 bg-emerald-500 hover:bg-emerald-600 hover:-translate-y-0.5 active:translate-y-0 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Category List - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 pr-2 min-h-0">{isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {/* All Items */}
            <button
              onClick={() => onSelectCategory('all')}
              className={`relative w-full px-4 py-3 rounded-lg text-left text-sm font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-emerald-100 text-emerald-700 border-l-4 border-emerald-500'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>All Items</span>
                <span className={`text-xs ${selectedCategory === 'all' ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {categories.reduce((sum, cat) => sum + (cat.itemCount || 0), 0)}
                </span>
              </div>
            </button>

            {/* Categories */}
            {filteredCategories.map((category) => (
              <div key={category.id} className="relative group">
                <button
                  onClick={() => onSelectCategory(category.id)}
                  className={`relative w-full px-4 py-3 rounded-lg text-left text-sm font-semibold transition-all pr-12 ${
                    selectedCategory === category.id
                      ? 'bg-emerald-100 text-emerald-700 border-l-4 border-emerald-500'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate flex-1">{category.name}</span>
                    <span className={`text-xs shrink-0 ${selectedCategory === category.id ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {category.itemCount || 0}
                    </span>
                  </div>
                  {!category.active && (
                    <Badge variant="secondary" className="mt-1 text-xs">Archived</Badge>
                  )}
                </button>
                
                {/* Context Menu Button */}
                <div className={`absolute right-2 top-1/2 -translate-y-1/2 transition-opacity ${
                  openMenuId === category.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <button
                    ref={(el) => {
                      if (el) buttonRefs.current.set(category.id, el);
                      else buttonRefs.current.delete(category.id);
                    }}
                    onClick={(e) => handleMenuButtonClick(category.id, e)}
                    className={`p-1.5 bg-white hover:bg-gray-50 rounded-lg shadow-sm ${
                      openMenuId === category.id ? 'bg-gray-100' : ''
                    }`}
                    title="More actions"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 16 16">
                      <circle cx="8" cy="3" r="1.5"/>
                      <circle cx="8" cy="8" r="1.5"/>
                      <circle cx="8" cy="13" r="1.5"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Context Menu Portal */}
      {openMenuId && menuPosition && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[9999] w-40 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
        >
          {filteredCategories
            .filter(cat => cat.id === openMenuId)
            .map(category => (
              <React.Fragment key={category.id}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditCategory(category);
                    setOpenMenuId(null);
                    setMenuPosition(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleActive(category);
                    setOpenMenuId(null);
                    setMenuPosition(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  {category.active ? 'Set Inactive' : 'Set Active'}
                </button>
              </React.Fragment>
            ))}
        </div>,
        document.body
      )}
    </aside>
  );
}

// ============================================================================
// MENU TOOLBAR
// ============================================================================

interface MenuToolbarProps {
  searchQuery: string;
  selectedStatus: string;
  sortOption: SortOption;
  archiveStatus: 'all' | 'archived';
  tempArchiveStatus: 'all' | 'archived';
  onSearchChange: (query: string) => void;
  onSearchSubmit?: () => void; // Trigger filter on Enter
  onStatusChange: (status: string) => void;
  onSortChange: (sort: SortOption) => void;
  onArchiveStatusChange: (status: 'all' | 'archived') => void;
  onTempArchiveStatusChange: (status: 'all' | 'archived') => void;
  onApplyArchiveFilter: () => void;
  onAddItem: () => void;
  // Mobile category selector
  categories?: Array<{ id: string; name: string }>;
  selectedCategory?: string;
  onSelectCategory?: (categoryId: string) => void;
  onAddCategory?: () => void;
}

export function MenuToolbar({
  searchQuery,
  selectedStatus,
  sortOption,
  archiveStatus,
  tempArchiveStatus,
  onSearchChange,
  onSearchSubmit,
  onStatusChange,
  onSortChange,
  onArchiveStatusChange,
  onTempArchiveStatusChange,
  onApplyArchiveFilter,
  onAddItem,
  // Mobile category props
  categories,
  selectedCategory,
  onSelectCategory,
  onAddCategory,
}: MenuToolbarProps) {
  return (
    <div className="bg-secondary border-b border-default px-4 lg:px-6 py-4">
      {/* Mobile Category Selector */}
      {categories && onSelectCategory && (
        <div className="lg:hidden mb-4 flex gap-2">
          <select
            value={selectedCategory || 'all'}
            onChange={(e) => onSelectCategory(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-elevated border border-default rounded-lg text-sm font-medium text-text-primary cursor-pointer transition-all focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {onAddCategory && (
            <button
              onClick={onAddCategory}
              className="px-3 py-2.5 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-600))] text-white rounded-lg transition-all"
              aria-label="Add category"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && onSearchSubmit) {
                  onSearchSubmit();
                }
              }}
              placeholder="Search menu items... (Press Enter to search)"
              className="w-full pl-10 pr-4 py-2.5 bg-elevated border border-default rounded-lg text-sm text-text-primary placeholder:text-text-tertiary transition-all hover:border-hover focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>

        {/* Filters - Responsive wrap */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="flex-1 min-w-[120px] sm:flex-none px-3 lg:px-4 py-2.5 bg-elevated border border-default rounded-lg text-sm font-medium text-text-primary cursor-pointer transition-all hover:border-hover focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          {/* Sort - Hidden on small mobile */}
          <div className="hidden sm:block">
            <Select
              options={SORT_OPTIONS.map((option) => ({
                value: option,
                label: option,
              }))}
              value={sortOption}
              onChange={(value) => onSortChange(value as SortOption)}
              size="md"
              triggerClassName="min-w-[180px]"
            />
          </div>

          {/* Archive Filter Dropdown - Hidden on mobile */}
          <div className="hidden md:block relative">
            <ArchiveFilterDropdown
              archiveStatus={archiveStatus}
              tempArchiveStatus={tempArchiveStatus}
              onTempArchiveStatusChange={onTempArchiveStatusChange}
              onApplyArchiveFilter={onApplyArchiveFilter}
            />
          </div>

          {/* Add Item Button - Responsive */}
          <button
            onClick={onAddItem}
            className="h-10 px-3 lg:px-4 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-600))] hover:-translate-y-0.5 active:translate-y-0 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Item</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MENU ITEM CARD
// ============================================================================

interface MenuItemCardProps {
  item: any; // Backend response type doesn't match frontend MenuItem exactly
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  onToggleAvailability?: (item: any) => void;
}

function getDietaryIcon(tag: DietaryTag) {
  switch (tag) {
    case 'vegetarian':
    case 'vegan':
      return <Leaf className="w-3 h-3" />;
    case 'spicy':
      return <Flame className="w-3 h-3" />;
    default:
      return null;
  }
}

/**
 * Format price for display
 * Supports VND (no decimals, with ₫) and USD ($XX.XX)
 */
function formatPrice(price: number, currency: 'VND' | 'USD' = 'USD'): string {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  }
  return '$' + price.toFixed(2);
}

export function MenuItemCard({ item, onEdit, onDelete, onToggleAvailability }: MenuItemCardProps) {
  // Map backend status to display status
  let displayStatus: 'available' | 'sold_out' | 'unavailable' = 'available';
  const statusStr = String((item as any).status);
  if (statusStr === 'SOLD_OUT') {
    displayStatus = 'sold_out';
  } else if (!(item as any).isAvailable) {
    displayStatus = 'unavailable';
  }

  const isAvailable = displayStatus === 'available';
  
  return (
    <div className="bg-white rounded-lg border border-[rgb(var(--border))] shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Image Container với Status Badge */}
      <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-[rgb(var(--primary-100))] to-[rgb(var(--neutral-100))] overflow-hidden">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <ImageIcon className="w-12 h-12 text-[rgb(var(--neutral-400))]" />
            <span className="text-xs text-[rgb(var(--neutral-500))]">No image</span>
          </div>
        )}
        
        {/* Status Badge - Top Right Corner */}
        <div className={`
          absolute top-3 right-3
          px-3 py-1 rounded-md
          text-[11px] font-semibold uppercase tracking-wide
          ${isAvailable 
            ? 'bg-[rgb(var(--success))] text-white' 
            : displayStatus === 'sold_out'
              ? 'bg-[rgb(var(--error))] text-white'
              : 'bg-[rgb(var(--neutral-500))] text-white'
          }
        `}>
          {isAvailable ? 'Available' : displayStatus === 'sold_out' ? 'Sold Out' : 'Unavailable'}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h4 className="text-lg font-semibold text-[rgb(var(--neutral-900))] line-clamp-1 mb-1">
          {item.name}
        </h4>
        
        {/* Category */}
        {item.categoryName && (
          <p className="text-[13px] text-[rgb(var(--neutral-500))] mb-2">
            {item.categoryName}
          </p>
        )}

        {/* Description */}
        <p className="text-sm text-[rgb(var(--neutral-600))] line-clamp-2 mb-3 min-h-[40px]">
          {item.description || 'No description available'}
        </p>

        {/* Price + Prep Time Row */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xl font-bold text-[rgb(var(--neutral-900))]">
            {formatPrice(item.price)}
          </span>
          {item.prepTime && (
            <span className="text-sm text-[rgb(var(--neutral-500))] flex items-center gap-1">
              ⏱ {item.prepTime} min
            </span>
          )}
        </div>

        {/* Rating + Orders Row */}
        <div className="flex items-center gap-4 text-sm text-[rgb(var(--neutral-600))] mb-4">
          {item.rating ? (
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-[rgb(var(--warning))] text-[rgb(var(--warning))]" />
              <span className="font-medium">{item.rating}</span>
              <span className="text-[rgb(var(--neutral-400))]">({item.reviewsCount || 0})</span>
            </span>
          ) : (
            <span className="text-[rgb(var(--neutral-400))]">No ratings yet</span>
          )}
          {item.ordersCount !== undefined && (
            <span className="text-[rgb(var(--neutral-500))]">
              {item.ordersCount} orders
            </span>
          )}
        </div>

        {/* Dietary Tags - Compact */}
        {((item.chefRecommended) || (item.dietary && item.dietary.length > 0)) && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {item.chefRecommended && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[rgb(var(--primary-100))] text-[rgb(var(--primary-700))] rounded-md text-xs font-medium">
                <Star className="w-3 h-3 fill-current" />
                Chef's Pick
              </span>
            )}
            {item.dietary?.slice(0, 2).map((tag: DietaryTag) => (
              <span
                key={tag}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                  tag === 'spicy' 
                    ? 'bg-[rgb(var(--error-100))] text-[rgb(var(--error-700))]' 
                    : 'bg-[rgb(var(--success-100))] text-[rgb(var(--success-700))]'
                }`}
              >
                {getDietaryIcon(tag)}
                <span className="capitalize">{tag}</span>
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2 pt-3 border-t border-[rgb(var(--border))]">
          {/* Edit Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
            className="flex-1 h-9 bg-[rgb(var(--neutral-100))] hover:bg-[rgb(var(--neutral-200))] border border-[rgb(var(--border))] rounded-lg flex items-center justify-center gap-1.5 text-[rgb(var(--neutral-700))] hover:text-[rgb(var(--neutral-900))] transition-colors text-sm font-medium"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          
          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
            className="h-9 w-9 bg-[rgb(var(--neutral-100))] hover:bg-[rgb(var(--error-100))] border border-[rgb(var(--border))] hover:border-[rgb(var(--error-200))] rounded-lg flex items-center justify-center text-[rgb(var(--neutral-600))] hover:text-[rgb(var(--error-600))] transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          {/* Availability Toggle */}
          {onToggleAvailability && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleAvailability(item);
              }}
              className={`
                h-9 px-3 rounded-lg flex items-center gap-1.5 text-sm font-medium transition-colors
                ${isAvailable 
                  ? 'bg-[rgb(var(--success-100))] text-[rgb(var(--success-700))] hover:bg-[rgb(var(--success-200))]' 
                  : 'bg-[rgb(var(--neutral-100))] text-[rgb(var(--neutral-600))] hover:bg-[rgb(var(--neutral-200))]'
                }
              `}
              title={isAvailable ? 'Mark as unavailable' : 'Mark as available'}
            >
              <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-[rgb(var(--success))]' : 'bg-[rgb(var(--neutral-400))]'}`} />
              {isAvailable ? 'On' : 'Off'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MENU ITEM GRID
// ============================================================================

interface MenuItemGridProps {
  items: any[]; // Backend response type
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  onToggleAvailability?: (item: any) => void;
  onAddItem: () => void;
  isLoading?: boolean;
  searchQuery?: string;
}

export function MenuItemGrid({
  items,
  onEdit,
  onDelete,
  onToggleAvailability,
  onAddItem,
  isLoading,
  searchQuery,
}: MenuItemGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-[rgb(var(--neutral-100))] rounded-lg animate-pulse" style={{ aspectRatio: '3/4' }} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-[rgb(var(--border))] p-12 text-center">
        <div className="w-20 h-20 bg-[rgb(var(--neutral-100))] rounded-full flex items-center justify-center mx-auto mb-4">
          <ImageIcon className="w-10 h-10 text-[rgb(var(--neutral-400))]" />
        </div>
        <h4 className="text-lg font-bold text-[rgb(var(--neutral-900))] mb-2">
          {searchQuery ? 'No items found' : 'No items yet'}
        </h4>
        <p className="text-sm text-[rgb(var(--neutral-600))] mb-6">
          {searchQuery ? 'Try adjusting your search or filters' : 'Add your first menu item to get started'}
        </p>
        {!searchQuery && (
          <button
            onClick={onAddItem}
            className="px-6 py-3 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-600))] text-white rounded-lg text-sm font-semibold inline-flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Item
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
      {items.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleAvailability={onToggleAvailability}
        />
      ))}
    </div>
  );
}
// ============================================================================
// ARCHIVE FILTER DROPDOWN (Click to toggle, not hover)
// ============================================================================

interface ArchiveFilterDropdownProps {
  archiveStatus: 'all' | 'archived';
  tempArchiveStatus: 'all' | 'archived';
  onTempArchiveStatusChange: (status: 'all' | 'archived') => void;
  onApplyArchiveFilter: () => void;
}

function ArchiveFilterDropdown({
  archiveStatus,
  tempArchiveStatus,
  onTempArchiveStatusChange,
  onApplyArchiveFilter,
}: ArchiveFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleApply = () => {
    onApplyArchiveFilter();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2.5 bg-white border border-[rgb(var(--border))] rounded-lg text-sm font-medium text-text-primary hover:border-[rgb(var(--primary-400))] transition-all flex items-center gap-2"
      >
        <span>{archiveStatus === 'all' ? 'Active' : 'Archived'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-[rgb(var(--border))] z-50 animate-in fade-in-0 zoom-in-95 duration-150">
            <div className="p-4 space-y-3">
              <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Show</p>
              {ARCHIVE_STATUS_OPTIONS.map((option) => (
                <label 
                  key={option.value} 
                  className="flex items-center gap-3 cursor-pointer group/radio p-2 rounded-lg hover:bg-[rgb(var(--primary-50))] transition-colors"
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    tempArchiveStatus === option.value 
                      ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))]' 
                      : 'border-gray-300'
                  }`}>
                    {tempArchiveStatus === option.value && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-text-primary">{option.label}</span>
                </label>
              ))}
              <button
                onClick={handleApply}
                className="w-full mt-3 h-10 px-4 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-600))] text-white rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-all"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}