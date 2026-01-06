'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UtensilsCrossed, CheckCircle } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import type { 
  CreateMenuCategoryDto, 
  UpdateMenuCategoryDto,
  CreateMenuItemDto,
} from '@/services/generated/models';

// Import feature hooks
import {
  useMenuCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useMenuItems,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  useUploadPhoto,
  useDeletePhoto,
  useModifiers,
  useMenuItem,
  useCategory,
  useToggleItemAvailability,
  useSetPrimaryPhoto,
  useItemPhotos,
} from '../hooks';

// Import extracted components
import {
  CategorySidebar,
  MenuToolbar,
  MenuItemGrid,
} from './MenuComponents';
import {
  MenuItemModal,
  CategoryModal,
  DeleteConfirmModal,
} from './MenuModals';

// Import types and constants
import type {
  Category,
  MenuItem,
  MenuItemFormData,
  MenuFilters,
  ModalMode,
  SortOption,
} from '../types';
import { INITIAL_MENU_ITEM_FORM } from '../constants';

export function MenuManagementPage() {
  const queryClient = useQueryClient();

  // ========== STATE ==========
  // Category state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<'add' | 'edit'>('add');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCategoryDisplayOrder, setNewCategoryDisplayOrder] = useState('');
  const [newCategoryActive, setNewCategoryActive] = useState(true);
  
  // Category filters
  const [categoryActiveOnly, setCategoryActiveOnly] = useState(false);
  const [categorySortBy, setCategorySortBy] = useState('displayOrder');

  // Filter state
  const [appliedFilters, setAppliedFilters] = useState<MenuFilters>({
    categoryId: 'all',
    status: 'All Status',
    sortBy: 'Sort by: Newest',
    searchQuery: '',
    availability: 'all',
    chefRecommended: false,
  });
  const [tempFilters, setTempFilters] = useState<MenuFilters>(appliedFilters);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState(''); // Separate state for input display

  // Item modal state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemModalMode, setItemModalMode] = useState<ModalMode>('add');
  const [currentEditItemId, setCurrentEditItemId] = useState<string | null>(null);
  const [itemFormData, setItemFormData] = useState<MenuItemFormData>(INITIAL_MENU_ITEM_FORM);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Toast notification
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Auto-hide toast
  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => setShowSuccessToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  // Search debounce - 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedFilters(prev => ({ ...prev, searchQuery: searchInputValue }));
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchInputValue]);

  // ========== FILTER HANDLERS ==========
  const handleTempFilterChange = (newFilters: Partial<MenuFilters>) => {
    setTempFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(tempFilters);
    setIsFilterDropdownOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters: MenuFilters = {
      categoryId: appliedFilters.categoryId, // Keep current category
      status: 'All Status',
      sortBy: appliedFilters.sortBy,         // Keep current sort
      searchQuery: appliedFilters.searchQuery, // Keep search
      availability: 'all',
      chefRecommended: false,
    };
    setTempFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setIsFilterDropdownOpen(false);
  };

  // ========== API QUERIES ==========
  const { data: categoriesData } = useMenuCategories();
  const categories = categoriesData || [];

  const { data: itemsData, isLoading: itemsLoading } = useMenuItems({
    categoryId: appliedFilters.categoryId,
    status: appliedFilters.status !== 'All Status' ? appliedFilters.status : undefined,
    availability: appliedFilters.availability as 'available' | 'unavailable',
    chefRecommended: appliedFilters.chefRecommended || undefined,
    searchQuery: appliedFilters.searchQuery || undefined,
    sortBy: appliedFilters.sortBy,
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
  });
  const menuItems = Array.isArray(itemsData) 
    ? itemsData 
    : (itemsData as any)?.data || [];

  console.log('[MenuManagementPage] Raw itemsData:', itemsData);
  console.log('[MenuManagementPage] Parsed menuItems count:', menuItems.length);

  const { data: modifierGroupsData } = useModifiers({ activeOnly: false });
  const modifierGroups = modifierGroupsData || [];

  // ========== MUTATIONS ==========
  // Category mutations
  const createCategoryMutation = useCreateCategory({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/v1/menu/categories'] });
        handleCloseCategoryModal();
        setToastMessage('Danh mục đã được tạo');
        setShowSuccessToast(true);
      },
      onError: (error) => {
        console.error('Error creating category:', error);
        setToastMessage('Có lỗi khi tạo danh mục');
        setShowSuccessToast(true);
      },
    }
  });

  const updateCategoryMutation = useUpdateCategory({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/v1/menu/categories'] });
        handleCloseCategoryModal();
        setToastMessage('Danh mục đã được cập nhật');
        setShowSuccessToast(true);
      },
      onError: (error) => {
        console.error('Error updating category:', error);
        setToastMessage('Có lỗi khi cập nhật danh mục');
        setShowSuccessToast(true);
      },
    }
  });

  const deleteCategoryMutation = useDeleteCategory({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/v1/menu/categories'] });
        setToastMessage('Danh mục đã được xóa');
        setShowSuccessToast(true);
      },
      onError: (error) => {
        console.error('Error deleting category:', error);
        setToastMessage('Có lỗi khi xóa danh mục');
        setShowSuccessToast(true);
      }
    }
  });

  // Item mutations
  const createItemMutation = useCreateMenuItem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/v1/menu/item'] });
        setToastMessage('Món ăn đã được tạo');
        setShowSuccessToast(true);
      },
      onError: (error) => {
        console.error('Error creating item:', error);
        setToastMessage('Có lỗi khi tạo món ăn');
        setShowSuccessToast(true);
      }
    }
  });

  const updateItemMutation = useUpdateMenuItem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/v1/menu/item'] });
        setToastMessage('Món ăn đã được cập nhật');
        setShowSuccessToast(true);
      },
      onError: (error) => {
        console.error('Error updating item:', error);
        setToastMessage('Có lỗi khi cập nhật món ăn');
        setShowSuccessToast(true);
      }
    }
  });

  const deleteItemMutation = useDeleteMenuItem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/v1/menu/item'] });
        setToastMessage('Món ăn đã được xóa');
        setShowSuccessToast(true);
      },
      onError: (error) => {
        console.error('Error deleting item:', error);
        setToastMessage('Có lỗi khi xóa món ăn');
        setShowSuccessToast(true);
      }
    }
  });

  const uploadPhotoMutation = useUploadPhoto({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/v1/menu/item'] });
        queryClient.invalidateQueries({ queryKey: ['menu', 'photos'] });
      },
      onError: (error: any) => {
        console.error('Error uploading photo:', error);
      }
    }
  });

  const deletePhotoMutation = useDeletePhoto({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/v1/menu/item'] });
        queryClient.invalidateQueries({ queryKey: ['menu', 'photos'] });
      },
      onError: (error: any) => {
        console.error('Error deleting photo:', error);
      }
    }
  });

  // ========== HELPER FUNCTIONS ==========
  const getCategoryItemCount = (categoryId: string) => {
    return menuItems.filter((item: any) => item.categoryId === categoryId).length;
  };

  const getFilteredAndSortedItems = () => {
    return menuItems
      .filter((item: any) => {
        // Category filter
        if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) return false;
        
        // Search filter
        if (appliedFilters.searchQuery.trim()) {
          const query = appliedFilters.searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(query);
          const matchDesc = item.description?.toLowerCase().includes(query);
          if (!matchName && !matchDesc) return false;
        }
        
        // Status filter
        if (appliedFilters.status !== 'All Status') {
          const statusMap: Record<string, string> = {
            'Draft': 'DRAFT',
            'Published': 'PUBLISHED',
            'Archived': 'ARCHIVED',
          };
          const targetStatus = statusMap[appliedFilters.status];
          if (item.status !== targetStatus) return false;
        }
        
        // Availability filter
        if (appliedFilters.availability && appliedFilters.availability !== 'all') {
          const isAvailable = item.isAvailable === true;
          const targetAvailable = appliedFilters.availability === 'available';
          if (isAvailable !== targetAvailable) return false;
        }
        
        // Chef Recommended filter
        if (appliedFilters.chefRecommended && !item.chefRecommended) {
          return false;
        }
        
        return true;
      })
      .sort((a: any, b: any) => {
        switch (appliedFilters.sortBy) {
          case 'Sort by: Newest':
            return new Date((b as any).createdAt || 0).getTime() - new Date((a as any).createdAt || 0).getTime();
          case 'Popularity':
            return ((b as any).popularity || 0) - ((a as any).popularity || 0);
          case 'Price (Low)':
            return (a as any).price - (b as any).price;
          case 'Price (High)':
            return (b as any).price - (a as any).price;
          default:
            return 0;
        }
      });
  };

  const allFilteredAndSortedItems = getFilteredAndSortedItems();
  const filteredItemsCount = allFilteredAndSortedItems.length;
  const totalPages = Math.ceil(filteredItemsCount / ITEMS_PER_PAGE);
  
  console.log('[MenuManagementPage] After filter/sort, items count:', filteredItemsCount);
  console.log('[MenuManagementPage] Total pages:', totalPages);
  console.log('[MenuManagementPage] Current page:', currentPage);
  
  // Apply pagination to filtered and sorted items
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const visibleMenuItems = allFilteredAndSortedItems.slice(startIndex, endIndex);
  
  console.log('[MenuManagementPage] Visible items (page slice):', visibleMenuItems.length);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters, selectedCategory]);

  // ========== EVENT HANDLERS ==========
  // Category handlers
  const handleOpenAddCategoryModal = () => {
    setCategoryModalMode('add');
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryDescription('');
    setNewCategoryDisplayOrder('');
    setNewCategoryActive(true);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setCategoryModalMode('edit');
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryDescription(category.description || '');
    setNewCategoryDisplayOrder(category.displayOrder.toString());
    setNewCategoryActive(category.active);
    setIsCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setCategoryModalMode('add');
    setNewCategoryName('');
    setNewCategoryDescription('');
    setNewCategoryDisplayOrder('');
    setNewCategoryActive(true);
  };

  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    const categoryData: CreateMenuCategoryDto = {
      name: newCategoryName,
      description: newCategoryDescription || undefined,
      active: newCategoryActive,
    };

    if (newCategoryDisplayOrder.trim()) {
      (categoryData as any).displayOrder = parseInt(newCategoryDisplayOrder);
    }

    if (categoryModalMode === 'edit' && editingCategory) {
      await updateCategoryMutation.mutateAsync({
        id: editingCategory.id,
        data: categoryData as UpdateMenuCategoryDto,
      });
    } else {
      await createCategoryMutation.mutateAsync(categoryData);
    }
  };

  const handleToggleCategoryActive = async (category: Category) => {
    await updateCategoryMutation.mutateAsync({
      id: category.id,
      data: { active: !category.active },
    });
    setToastMessage(`Danh mục "${category.name}" đã ${!category.active ? 'kích hoạt' : 'vô hiệu hóa'}`);
    setShowSuccessToast(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    await deleteCategoryMutation.mutateAsync(categoryId);
  };

  // Item modal handlers
  const handleOpenAddItemModal = () => {
    setItemModalMode('add');
    setCurrentEditItemId(null);
    setItemFormData({
      ...INITIAL_MENU_ITEM_FORM,
      categoryId: selectedCategory,
    });
    setIsItemModalOpen(true);
  };

  const handleOpenEditItemModal = (item: MenuItem) => {
    setItemModalMode('edit');
    setCurrentEditItemId(item.id);
    setItemFormData({
      name: item.name,
      categoryId: item.categoryId,                           // Updated field name
      description: item.description || '',
      price: item.price,                                     // Number, not string
      status: item.status,                                   // DRAFT/PUBLISHED/ARCHIVED
      available: item.isAvailable,                           // Boolean availability
      preparationTime: item.preparationTime || 0,            // Added field
      allergens: item.allergens || [],                       // Added field
      dietary: item.dietary || [],
      chefRecommended: item.chefRecommended || false,
      displayOrder: item.displayOrder || 0,                  // Added field
      photos: [],                                            // Empty photos for edit (will be uploaded separately)
      modifierGroupIds: item.modifierGroups?.map(g => g.id) || [],
    });
    setIsItemModalOpen(true);
  };

  const handleCloseItemModal = () => {
    setIsItemModalOpen(false);
    setCurrentEditItemId(null);
    setItemFormData(INITIAL_MENU_ITEM_FORM);
  };

  const handleSaveItem = async () => {
    // Validation
    if (!itemFormData.name.trim() || itemFormData.price <= 0 || !itemFormData.categoryId) {
      setToastMessage('Please fill in all required fields');
      setShowSuccessToast(true);
      return;
    }

    // Validate preparation time range
    if (itemFormData.preparationTime < 0 || itemFormData.preparationTime > 240) {
      setToastMessage('Preparation time must be between 0 and 240 minutes');
      setShowSuccessToast(true);
      return;
    }

    try {
      if (itemModalMode === 'add') {
        // Step 1: Create item
        const result = await createItemMutation.mutateAsync({
          name: itemFormData.name,
          categoryId: itemFormData.categoryId,              // Updated
          description: itemFormData.description || undefined,
          price: itemFormData.price,                        // Already number
          status: itemFormData.status,                      // Publication status
          preparationTime: itemFormData.preparationTime,    // Added
          available: itemFormData.available,                // Added
          allergens: itemFormData.allergens,                // Added
          tags: itemFormData.dietary,                       // Map dietary to tags
          chefRecommended: itemFormData.chefRecommended,
          displayOrder: itemFormData.displayOrder,          // Added
          modifierGroupIds: itemFormData.modifierGroupIds,
        } as CreateMenuItemDto);

        // Step 2: Upload photos and delete marked photos in parallel
        if (result?.id) {
          const uploadPromises: Promise<any>[] = [];
          const deletePromises: Promise<any>[] = [];

          // Upload new photos
          const newPhotos = itemFormData.photos.filter(p => p.file);
          for (const photo of newPhotos) {
            uploadPromises.push(
              uploadPhotoMutation.mutateAsync({
                itemId: result.id,
                file: photo.file,
              })
            );
          }

          // Delete marked photos (if any)
          for (const photoId of itemFormData.photosToDelete || []) {
            deletePromises.push(
              deletePhotoMutation.mutateAsync({
                itemId: result.id,
                photoId,
              })
            );
          }

          // Execute all in parallel
          if (uploadPromises.length || deletePromises.length) {
            await Promise.all([...uploadPromises, ...deletePromises]);
          }
        }

        setToastMessage(`Món "${itemFormData.name}" đã được tạo`);
      } else if (currentEditItemId) {
        // Step 1: Update item (PATCH) - can be done in parallel
        const updatePromises = [
          updateItemMutation.mutateAsync({
            id: currentEditItemId,
            data: {
              name: itemFormData.name,
              categoryId: itemFormData.categoryId,            // Updated
              description: itemFormData.description || undefined,
              price: itemFormData.price,                      // Already number
              status: itemFormData.status,                    // Publication status
              preparationTime: itemFormData.preparationTime,  // Added
              available: itemFormData.available,              // Added
              allergens: itemFormData.allergens,              // Added
              tags: itemFormData.dietary,                     // Map dietary to tags
              chefRecommended: itemFormData.chefRecommended,
              displayOrder: itemFormData.displayOrder,        // Added
              modifierGroupIds: itemFormData.modifierGroupIds,
            }
          })
        ];

        // Step 2: Upload new photos in parallel
        const newPhotos = itemFormData.photos.filter(p => p.file);
        for (const photo of newPhotos) {
          updatePromises.push(
            uploadPhotoMutation.mutateAsync({
              itemId: currentEditItemId,
              file: photo.file,
            })
          );
        }

        // Step 3: Delete marked photos in parallel
        for (const photoId of itemFormData.photosToDelete || []) {
          updatePromises.push(
            deletePhotoMutation.mutateAsync({
              itemId: currentEditItemId,
              photoId,
            })
          );
        }

        // Execute all in parallel
        await Promise.all(updatePromises);

        setToastMessage(`Món "${itemFormData.name}" đã được cập nhật`);
      }

      setShowSuccessToast(true);
      handleCloseItemModal();
    } catch (error) {
      console.error('Error in handleSaveItem:', error);
    }
  };

  const handleDeleteClick = (item: MenuItem) => {
    setItemToDelete({ id: item.id, name: item.name });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteItemMutation.mutateAsync(itemToDelete.id);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error in handleConfirmDelete:', error);
    }
  };

  // Filter handlers
  const handleSearchChange = (query: string) => {
    setSearchInputValue(query); // Only update display
  };

  const handleSearchSubmit = () => {
    // Apply search with debounce handled in separate useEffect
    setAppliedFilters({ ...appliedFilters, searchQuery: searchInputValue });
  };

  const handleSortChange = (sortBy: string) => {
    setAppliedFilters({ ...appliedFilters, sortBy: sortBy as any });
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setAppliedFilters({ ...appliedFilters, categoryId });
  };

  // Toggle item availability
  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const newAvailable = !item.isAvailable;
      await updateItemMutation.mutateAsync({
        id: item.id,
        data: {
          available: newAvailable,
        }
      });
      setToastMessage(`"${item.name}" is now ${newAvailable ? 'available' : 'unavailable'}`);
      setShowSuccessToast(true);
    } catch (error) {
      console.error('Error toggling availability:', error);
      setToastMessage('Failed to update availability');
      setShowSuccessToast(true);
    }
  };

  // ========== RENDER ==========
  // Calculate stats
  const totalItems = menuItems.filter((item: any) => item.status !== 'ARCHIVED').length;
  const activeItems = menuItems.filter((item: any) => item.isAvailable && item.status !== 'ARCHIVED').length;

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-primary">
      {/* Category Sidebar */}
      <CategorySidebar
        categories={categories.map((cat: any) => ({
          ...cat,
          itemCount: getCategoryItemCount(cat.id),
        })) as any}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onAddCategory={handleOpenAddCategoryModal}
        onDeleteCategory={handleDeleteCategory}
        onEditCategory={handleEditCategory}
        onToggleActive={handleToggleCategoryActive}
        activeOnly={categoryActiveOnly}
        onActiveOnlyChange={setCategoryActiveOnly}
        sortBy={categorySortBy}
        onSortChange={setCategorySortBy}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Toolbar */}
        <MenuToolbar
          searchQuery={searchInputValue}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          
          isFilterDropdownOpen={isFilterDropdownOpen}
          appliedFilters={appliedFilters}
          tempFilters={tempFilters}
          onFilterDropdownToggle={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
          onTempFilterChange={handleTempFilterChange}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
          onCloseFilterDropdown={() => setIsFilterDropdownOpen(false)}
          
          sortOption={appliedFilters.sortBy as SortOption}
          onSortChange={handleSortChange}
          onAddItem={handleOpenAddItemModal}
          
          // Mobile category props
          categories={categories.map((cat: any) => ({ id: cat.id, name: cat.name }))}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          onAddCategory={handleOpenAddCategoryModal}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-tertiary mb-1">
                    Total Items
                  </p>
                  <p className="text-2xl font-bold text-text-primary">
                    {totalItems}
                  </p>
                  <p className="text-xs text-text-tertiary mt-1">
                    All menu items in your system
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent-500/20 rounded-lg flex items-center justify-center">
                  <UtensilsCrossed className="w-6 h-6 text-accent-500" />
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-tertiary mb-1">
                    Active Items
                  </p>
                  <p className="text-2xl font-bold text-text-primary">
                    {activeItems}
                  </p>
                  <p className="text-xs text-text-tertiary mt-1">
                    Currently available items
                  </p>
                </div>
                <div className="w-12 h-12 bg-success-bg rounded-lg flex items-center justify-center border border-success-border">
                  <CheckCircle className="w-6 h-6 text-success-text" />
                </div>
              </div>
            </Card>
          </div>

          {/* Item Grid */}
          <MenuItemGrid
            items={visibleMenuItems}
            onEdit={handleOpenEditItemModal}
            onDelete={handleDeleteClick}
            onToggleAvailability={handleToggleAvailability}
            onAddItem={handleOpenAddItemModal}
            isLoading={itemsLoading}
            searchQuery={appliedFilters.searchQuery}
          />

          {/* Pagination Controls */}
          {filteredItemsCount > 0 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[rgb(var(--border))]">
              <div className="text-sm text-[rgb(var(--neutral-600))]">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredItemsCount)} of {filteredItemsCount} items
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-[rgb(var(--border))] rounded-lg text-sm font-medium text-[rgb(var(--neutral-700))] hover:bg-[rgb(var(--primary-100))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-emerald-500 text-white'
                          : 'border border-[rgb(var(--border))] text-[rgb(var(--neutral-700))] hover:bg-[rgb(var(--primary-100))]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-[rgb(var(--border))] rounded-lg text-sm font-medium text-[rgb(var(--neutral-700))] hover:bg-[rgb(var(--primary-100))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <MenuItemModal
        isOpen={isItemModalOpen}
        mode={itemModalMode}
        itemId={currentEditItemId || undefined}
        formData={itemFormData}
        categories={categories as any}
        modifierGroups={modifierGroups}
        onClose={handleCloseItemModal}
        onSave={handleSaveItem}
        onFormChange={setItemFormData}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        mode={categoryModalMode}
        categoryId={editingCategory?.id}
        name={newCategoryName}
        description={newCategoryDescription}
        displayOrder={newCategoryDisplayOrder}
        active={newCategoryActive}
        onNameChange={setNewCategoryName}
        onDescriptionChange={setNewCategoryDescription}
        onDisplayOrderChange={setNewCategoryDisplayOrder}
        onActiveChange={setNewCategoryActive}
        onClose={handleCloseCategoryModal}
        onSave={handleSaveCategory}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        itemName={itemToDelete?.name || ''}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-success-solid to-emerald-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-slide-in-right">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
